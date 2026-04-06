import { NextResponse } from "next/server";

type ReverseGeoResult = {
  city?: string;
  name?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 },
    );
  }

  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
    return NextResponse.json(
      { error: "Latitude and longitude must be valid numbers." },
      { status: 400 },
    );
  }

  try {
    const [weatherResult, reverseResult] = await Promise.allSettled([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${parsedLatitude}&longitude=${parsedLongitude}&current=temperature_2m,wind_speed_10m,weather_code`,
        { next: { revalidate: 300 } },
      ),
      fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${parsedLatitude}&longitude=${parsedLongitude}&language=es&count=1`,
        { next: { revalidate: 300 } },
      ),
    ]);

    if (weatherResult.status !== "fulfilled" || !weatherResult.value.ok) {
      return NextResponse.json(
        { error: "Weather provider request failed." },
        { status: 502 },
      );
    }

    const weatherJson = await weatherResult.value.json();
    const reverseJson =
      reverseResult.status === "fulfilled" && reverseResult.value.ok
        ? await reverseResult.value.json()
        : null;

    const result = reverseJson?.results?.[0] as ReverseGeoResult | undefined;
    const current = weatherJson?.current;

    if (
      !current ||
      typeof current.temperature_2m !== "number" ||
      typeof current.wind_speed_10m !== "number" ||
      typeof current.weather_code !== "number"
    ) {
      return NextResponse.json(
        { error: "Current weather data is unavailable." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      city: result?.city ?? result?.name ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch weather data." },
      { status: 502 },
    );
  }
}

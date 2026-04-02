"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "@/styles/intranet-dashboard.module.css";

type WeatherState = {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  city: string | null;
};

const modules = [
  {
    href: "/intranet/clientes",
    label: "Directorio",
    title: "Clientes",
    description: "Fichas de clientes, contactos y proyectos asociados.",
  },
  {
    href: "/intranet/proyectos",
    label: "Trabajo activo",
    title: "Proyectos",
    description: "Documentación técnica, endpoints API, tareas y tiempo dedicado.",
  },
  {
    href: "/intranet/links",
    label: "Accesos rápidos",
    title: "Links",
    description: "Herramientas externas, dashboards y recursos organizados.",
  },
];

const weatherLabels = new Map<number, string>([
  [0, "Cielo despejado"],
  [1, "Mayormente despejado"],
  [2, "Intervalos nubosos"],
  [3, "Cubierto"],
  [45, "Niebla"],
  [48, "Niebla con escarcha"],
  [51, "Llovizna ligera"],
  [53, "Llovizna moderada"],
  [55, "Llovizna intensa"],
  [61, "Lluvia ligera"],
  [63, "Lluvia moderada"],
  [65, "Lluvia intensa"],
  [71, "Nieve ligera"],
  [73, "Nieve moderada"],
  [75, "Nieve intensa"],
  [80, "Chubascos ligeros"],
  [81, "Chubascos moderados"],
  [82, "Chubascos intensos"],
  [95, "Tormenta"],
]);

export function IntranetDashboard() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [weatherStatus, setWeatherStatus] = useState(
    "Buscando tu ubicacion para mostrar el tiempo actual.",
  );

  const weatherDescription = useMemo(() => {
    if (!weather) return weatherStatus;
    const label = weatherLabels.get(weather.weatherCode) ?? "Tiempo variable";
    const cityLabel = weather.city ? ` en ${weather.city}` : "";
    return `${label}${cityLabel}. ${Math.round(weather.temperature)} grados y viento de ${Math.round(weather.windSpeed)} km/h.`;
  }, [weather, weatherStatus]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather(latitude: number, longitude: number) {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`,
      );
      const weatherJson = await weatherResponse.json();

      const reverseResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=es&count=1`,
      );
      const reverseJson = await reverseResponse.json();

      if (cancelled) return;

      const result = reverseJson?.results?.[0];
      const current = weatherJson?.current;

      if (!current) {
        setWeatherStatus("No se ha podido recuperar el tiempo actual.");
        return;
      }

      setWeather({
        temperature: current.temperature_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        city: result?.city ?? result?.name ?? null,
      });
    }

    function requestWeather() {
      if (!("geolocation" in navigator)) {
        setWeatherStatus("Tu navegador no permite geolocalizacion.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          void loadWeather(coords.latitude, coords.longitude).catch(() => {
            if (!cancelled) setWeatherStatus("No se ha podido consultar el servicio meteorologico.");
          });
        },
        () => {
          if (!cancelled) setWeatherStatus("Activa la ubicacion para ver el tiempo local.");
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    }

    requestWeather();

    return () => { cancelled = true; };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Dashboard</p>
        <h1>Roqueta</h1>
      </div>

      <section className={styles.hero}>
        <article className={styles.heroCard}>
          <p className={styles.label}>Estado del sistema</p>
          <h2>Intranet operativa.</h2>
          <p>
            Acceso privado activo. Usa la navegación lateral para gestionar
            clientes, proyectos, tiempo de trabajo y accesos directos.
          </p>
        </article>

        <article className={styles.weatherCard}>
          <p className={styles.label}>Tiempo en tu ubicación</p>
          <h3>{weather ? `${Math.round(weather.temperature)}°C` : "Tiempo local"}</h3>
          <p>{weatherDescription}</p>
          <span className={styles.weatherNote}>
            Datos obtenidos desde tu ubicación actual.
          </span>
        </article>
      </section>

      <section className={styles.grid}>
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className={styles.card}>
            <span>{mod.label}</span>
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

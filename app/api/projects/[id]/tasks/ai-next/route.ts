import { NextResponse } from "next/server";

import {
  DEFAULT_GEMINI_MODEL,
  extractJsonObject,
  parseTaskRecommendationResponse,
  type TaskPlanAvailabilityResponse,
  type TaskRecommendationRequest,
} from "@/lib/taskPlanning";

function getAvailability(): TaskPlanAvailabilityResponse {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    return {
      available: false,
      model,
      disabledReason:
        "Configura GEMINI_API_KEY en el servidor para activar el enfoque IA.",
    };
  }

  return {
    available: true,
    model,
  };
}

function isTaskRecommendationRequest(
  value: unknown,
): value is TaskRecommendationRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const project = record.project;
  const tasks = record.tasks;

  return (
    !!project &&
    typeof project === "object" &&
    !Array.isArray(project) &&
    Array.isArray(tasks) &&
    (record.apiKeyOverride === undefined ||
      typeof record.apiKeyOverride === "string")
  );
}

function buildPrompt(input: TaskRecommendationRequest) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date());

  const candidateTasks = input.tasks
    .filter((task) => task.status !== "done")
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate || "",
      status: task.status,
    }));

  return `
Eres un responsable de delivery. Debes elegir UNA sola tarea sobre la que el equipo deberia trabajar ahora mismo.

Fecha actual: ${today}
Idioma de salida: espanol

Criterios:
- Decide entre las tareas no completadas.
- Prioriza combinando prioridad, cercania de fecha limite, estado actual y claridad del siguiente paso.
- Si hay una tarea en review o in_progress muy urgente, puedes escogerla.
- Si hay varias opciones similares, elige la que desbloquee mas avance.
- Devuelve SOLO JSON valido, sin markdown ni texto extra.

JSON esperado:
{
  "recommendedTaskId": "id exacto de una tarea existente",
  "urgencyLabel": "Ahora | Hoy | Esta semana",
  "reasoning": "Explicacion breve y accionable de por que empezar por esta tarea"
}

Proyecto:
${JSON.stringify(
    {
      id: input.project.id,
      name: input.project.name,
      description: input.project.description || "",
      notes: input.project.notes || "",
      tags: input.project.tags || [],
      clientName: input.project.clientName || "",
      planningSummary: input.project.taskPlanningSummary || "",
    },
    null,
    2,
  )}

Cliente:
${JSON.stringify(input.client, null, 2)}

Tareas candidatas:
${JSON.stringify(candidateTasks, null, 2)}
`.trim();
}

export async function GET() {
  return NextResponse.json(getAvailability(), { status: 200 });
}

export async function POST(request: Request) {
  const availability = getAvailability();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON valido." },
      { status: 400 },
    );
  }

  if (!isTaskRecommendationRequest(body)) {
    return NextResponse.json(
      { error: "Faltan datos para recomendar la siguiente tarea." },
      { status: 400 },
    );
  }

  const input = body as TaskRecommendationRequest;
  const openTasks = input.tasks.filter((task) => task.status !== "done");
  const apiKey = input.apiKeyOverride?.trim() || process.env.GEMINI_API_KEY?.trim() || "";

  if (!apiKey) {
    return NextResponse.json(availability, { status: 503 });
  }

  if (openTasks.length === 0) {
    return NextResponse.json(
      { error: "No hay tareas abiertas para recomendar." },
      { status: 400 },
    );
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${availability.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "Devuelve respuestas estrictamente estructuradas para recomendar la siguiente tarea del proyecto.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        cache: "no-store",
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return NextResponse.json(
        {
          error: "Gemini no ha podido recomendar la siguiente tarea.",
          detail: errorText.slice(0, 400),
        },
        { status: 502 },
      );
    }

    const geminiJson = (await geminiResponse.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const responseText =
      geminiJson.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim() ?? "";

    const parsed = parseTaskRecommendationResponse(
      extractJsonObject(responseText),
      availability.model,
      new Set(openTasks.map((task) => task.id)),
    );

    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "La respuesta de Gemini no ha devuelto una recomendacion valida.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se ha podido conectar con Gemini en este momento." },
      { status: 502 },
    );
  }
}

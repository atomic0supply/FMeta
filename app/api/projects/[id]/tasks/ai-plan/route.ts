import { NextResponse } from "next/server";

import {
  DEFAULT_GEMINI_MODEL,
  MAX_TASK_PLANNING_INPUT_CHARS,
  extractJsonObject,
  parseTaskPlanResponse,
  type TaskPlanAvailabilityResponse,
  type TaskPlanRequest,
} from "@/lib/taskPlanning";

function getAvailability(): TaskPlanAvailabilityResponse {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    return {
      available: false,
      model,
      disabledReason:
        "Configura GEMINI_API_KEY en el servidor para activar el planificador IA.",
    };
  }

  return {
    available: true,
    model,
  };
}

function isTaskPlanRequest(value: unknown): value is TaskPlanRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const project = record.project;
  const tasks = record.tasks;

  return (
    typeof record.contextText === "string" &&
    !!project &&
    typeof project === "object" &&
    !Array.isArray(project) &&
    Array.isArray(tasks) &&
    (record.apiKeyOverride === undefined ||
      typeof record.apiKeyOverride === "string")
  );
}

function buildPrompt(input: TaskPlanRequest) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date());

  const projectPayload = {
    id: input.project.id,
    name: input.project.name,
    description: input.project.description || "",
    notes: input.project.notes || "",
    tags: input.project.tags || [],
    clientName: input.project.clientName || "",
    planningSummary: input.project.taskPlanningSummary || "",
  };

  const clientPayload = input.client
    ? {
        name: input.client.name || "",
        sector: input.client.sector || "",
        contact: input.client.contact || "",
        email: input.client.email || "",
        notes: input.client.notes || "",
      }
    : null;

  const tasksPayload = input.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.dueDate || "",
    status: task.status,
  }));

  return `
Eres un asistente senior de operaciones de proyectos. Tu trabajo es convertir contexto desordenado en nuevas tareas claras y accionables para un tablero de proyecto.

Fecha actual: ${today}
Idioma de salida: espanol

Reglas obligatorias:
- Devuelve SOLO JSON valido, sin markdown y sin texto extra.
- No modifiques tareas existentes; solo propone tareas nuevas.
- Evita duplicados o tareas casi identicas a las ya existentes.
- Cada tarea debe ser concreta, ejecutable y escrita en espanol.
- Cada tarea debe incluir una fecha limite realista en formato YYYY-MM-DD.
- Usa solo estas prioridades: low, medium, high.
- La descripcion debe explicar el entregable o la accion esperada.
- sourceNote debe resumir brevemente de que parte del contexto sale la tarea.
- Si el contexto no justifica nuevas tareas, devuelve proposedTasks vacio y explica el motivo en summary.
- Propone como maximo 8 tareas.

JSON esperado:
{
  "summary": "Resumen corto reutilizable del contexto estable del proyecto",
  "proposedTasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low | medium | high",
      "dueDate": "YYYY-MM-DD",
      "sourceNote": "string"
    }
  ]
}

Contexto del proyecto:
${JSON.stringify(projectPayload, null, 2)}

Contexto del cliente:
${JSON.stringify(clientPayload, null, 2)}

Tareas ya existentes:
${JSON.stringify(tasksPayload, null, 2)}

Texto nuevo pegado por el usuario:
${JSON.stringify(input.contextText.slice(0, MAX_TASK_PLANNING_INPUT_CHARS))}
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

  if (!isTaskPlanRequest(body)) {
    return NextResponse.json(
      { error: "Faltan datos para generar la propuesta de tareas." },
      { status: 400 },
    );
  }

  const input: TaskPlanRequest = {
    ...body,
    contextText: body.contextText.trim(),
    apiKeyOverride: body.apiKeyOverride?.trim() || "",
  };

  if (!input.contextText) {
    return NextResponse.json(
      { error: "Pega primero el contexto que quieres convertir en tareas." },
      { status: 400 },
    );
  }

  const apiKey = input.apiKeyOverride || process.env.GEMINI_API_KEY?.trim() || "";

  if (!apiKey) {
    return NextResponse.json(availability, { status: 503 });
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
                text: "Devuelve respuestas estrictamente estructuradas para la planificacion de tareas.",
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
            temperature: 0.4,
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
          error: "Gemini no ha podido generar la propuesta de tareas.",
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

    const parsed = parseTaskPlanResponse(
      extractJsonObject(responseText),
      availability.model,
    );

    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "La respuesta de Gemini no ha devuelto un formato valido para las tareas.",
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

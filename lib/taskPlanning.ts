import type { TaskPriority, TaskStatus } from "@/lib/tasks";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

export const MAX_TASK_PLANNING_INPUT_CHARS = 12000;

export type ProjectPlanningSnapshot = {
  id: string;
  name: string;
  description: string;
  notes: string;
  tags: string[];
  clientName: string;
  taskPlanningSummary?: string;
};

export type ClientPlanningSnapshot = {
  name: string;
  sector: string;
  contact: string;
  email: string;
  notes: string;
};

export type ExistingTaskPlanningSnapshot = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
};

export type TaskPlanRequest = {
  contextText: string;
  project: ProjectPlanningSnapshot;
  client: ClientPlanningSnapshot | null;
  tasks: ExistingTaskPlanningSnapshot[];
};

export type TaskDraft = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  sourceNote: string;
};

export type TaskPlanResponse = {
  model: string;
  summary: string;
  proposedTasks: TaskDraft[];
};

export type TaskPlanAvailabilityResponse = {
  available: boolean;
  model: string;
  disabledReason?: string;
};

export type TaskRecommendationRequest = {
  project: ProjectPlanningSnapshot;
  client: ClientPlanningSnapshot | null;
  tasks: ExistingTaskPlanningSnapshot[];
};

export type TaskRecommendationResponse = {
  model: string;
  recommendedTaskId: string;
  reasoning: string;
  urgencyLabel: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high";
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseTaskPlanResponse(
  value: unknown,
  model: string,
): TaskPlanResponse | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const summary = cleanText(record.summary, 2400);
  if (!summary) {
    return null;
  }

  const proposedTasksRaw = Array.isArray(record.proposedTasks)
    ? record.proposedTasks
    : null;

  if (!proposedTasksRaw) {
    return null;
  }

  const proposedTasks: TaskDraft[] = [];

  for (const item of proposedTasksRaw) {
    const taskRecord = asRecord(item);
    if (!taskRecord) {
      return null;
    }

    const title = cleanText(taskRecord.title, 140);
    const description = cleanText(taskRecord.description, 1200);
    const sourceNote = cleanText(taskRecord.sourceNote, 240);
    const priority = taskRecord.priority;
    const dueDate = taskRecord.dueDate;

    if (
      !title ||
      !description ||
      !sourceNote ||
      !isTaskPriority(priority) ||
      !isIsoDate(dueDate)
    ) {
      return null;
    }

    proposedTasks.push({
      title,
      description,
      priority,
      dueDate,
      sourceNote,
    });
  }

  return {
    model,
    summary,
    proposedTasks,
  };
}

export function parseTaskRecommendationResponse(
  value: unknown,
  model: string,
  validTaskIds: Set<string>,
): TaskRecommendationResponse | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const recommendedTaskId = cleanText(record.recommendedTaskId, 120);
  const reasoning = cleanText(record.reasoning, 600);
  const urgencyLabel = cleanText(record.urgencyLabel, 80);

  if (
    !recommendedTaskId ||
    !validTaskIds.has(recommendedTaskId) ||
    !reasoning ||
    !urgencyLabel
  ) {
    return null;
  }

  return {
    model,
    recommendedTaskId,
    reasoning,
    urgencyLabel,
  };
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (!fencedMatch) {
      return null;
    }

    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      return null;
    }
  }
}

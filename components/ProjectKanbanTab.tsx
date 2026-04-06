"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  createTask,
  deleteTask,
  subscribeToTasks,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
  updateTask,
} from "@/lib/tasks";
import styles from "@/styles/intranet-kanban.module.css";

type View = "kanban" | "list" | "gantt";

type Props = {
  projectId: string;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Pendiente",
  in_progress: "En progreso",
  review: "Revisión",
  done: "Hecho",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const GANTT_WEEKS = 10;
const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;

function ganttTimeline() {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now.getTime() - (dow === 0 ? 6 : dow - 1) * DAY_MS);
  monday.setHours(0, 0, 0, 0);
  const start = new Date(monday.getTime() - 3 * WEEK_MS);
  const end = new Date(start.getTime() + GANTT_WEEKS * WEEK_MS);
  return { start, end, total: end.getTime() - start.getTime() };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function isOverdue(iso: string): boolean {
  return new Date(iso + "T23:59:59") < new Date();
}

const emptyForm: TaskInput = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  order: 0,
};

export function ProjectKanbanTab({ projectId }: Props) {
  const [view, setView] = useState<View>("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToTasks(projectId, setTasks);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    if (drawerOpen) setTimeout(() => titleRef.current?.focus(), 120);
  }, [drawerOpen]);

  function openNew(status: TaskStatus = "todo") {
    setEditingTask(null);
    setForm({ ...emptyForm, status, order: Date.now() });
    setConfirmDelete(false);
    setDrawerOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? "",
      order: task.order,
    });
    setConfirmDelete(false);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingTask(null);
    setConfirmDelete(false);
  }

  function handleField(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(projectId, editingTask.id, form);
      } else {
        await createTask(projectId, form);
      }
      closeDrawer();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingTask) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteTask(projectId, editingTask.id);
    closeDrawer();
  }

  // Drag and drop
  function handleDragStart(taskId: string) {
    setDraggingId(taskId);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
  }

  async function handleDrop(col: TaskStatus) {
    if (!draggingId || draggingId === "") return;
    const task = tasks.find((t) => t.id === draggingId);
    if (task && task.status !== col) {
      await updateTask(projectId, draggingId, { status: col });
    }
    setDraggingId(null);
    setDragOverCol(null);
  }

  // Gantt
  const { start: gStart, end: gEnd, total: gTotal } = useMemo(
    () => ganttTimeline(),
    [],
  );

  const ganttWeeks = useMemo(() => {
    const weeks: { label: string; leftPct: number; isThisWeek: boolean }[] = [];
    for (let i = 0; i < GANTT_WEEKS; i++) {
      const weekStart = new Date(gStart.getTime() + i * WEEK_MS);
      const isThisWeek =
        weekStart.getTime() <= Date.now() &&
        Date.now() < weekStart.getTime() + WEEK_MS;
      weeks.push({
        label: weekStart.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
        leftPct: (i / GANTT_WEEKS) * 100,
        isThisWeek,
      });
    }
    return weeks;
  }, [gStart]);

  const todayPct = useMemo(
    () => ((Date.now() - gStart.getTime()) / gTotal) * 100,
    [gStart, gTotal],
  );

  const taskCount = tasks.length;

  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.viewToggle}>
          {(["kanban", "list", "gantt"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`${styles.viewBtn} ${view === v ? styles.viewBtnActive : ""}`}
            >
              {v === "kanban" && "Kanban"}
              {v === "list" && "Lista"}
              {v === "gantt" && "Gantt"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => openNew()}
          className={styles.btnNew}
        >
          <Plus width={13} height={13} strokeWidth={2} />
          Nueva tarea
        </button>
      </div>

      {taskCount === 0 && (
        <p className={styles.empty}>
          No hay tareas todavía. Crea la primera con el botón de arriba.
        </p>
      )}

      {/* ── KANBAN ── */}
      {view === "kanban" && taskCount > 0 && (
        <div className={styles.board}>
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div
                key={col}
                className={`${styles.column} ${dragOverCol === col && draggingId ? styles.columnOver : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col);
                }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => void handleDrop(col)}
              >
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>
                    {STATUS_LABELS[col]}
                  </span>
                  <span className={styles.columnCount}>{colTasks.length}</span>
                </div>

                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`${styles.card} ${draggingId === task.id ? styles.cardDragging : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => openEdit(task)}
                  >
                    <span className={styles.cardTitle}>{task.title}</span>
                    <div className={styles.cardMeta}>
                      <span
                        className={styles.priorityDot}
                        data-priority={task.priority}
                        title={PRIORITY_LABELS[task.priority]}
                      />
                      {task.dueDate && (
                        <span
                          className={`${styles.dueDate} ${isOverdue(task.dueDate) && task.status !== "done" ? styles.dueDateOverdue : ""}`}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => openNew(col)}
                  className={styles.columnAddBtn}
                >
                  + tarea
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIST ── */}
      {view === "list" && taskCount > 0 && (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <span>Tarea</span>
            <span>Prioridad</span>
            <span>Estado</span>
            <span>Vencimiento</span>
            <span />
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className={styles.listRow}
              onClick={() => openEdit(task)}
            >
              <span className={styles.listTitle}>{task.title}</span>
              <span
                className={styles.priorityPill}
                data-priority={task.priority}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className={styles.statusPill} data-status={task.status}>
                {STATUS_LABELS[task.status]}
              </span>
              <span
                className={`${styles.listDue} ${task.dueDate && isOverdue(task.dueDate) && task.status !== "done" ? styles.listDueOverdue : ""}`}
              >
                {task.dueDate ? formatDate(task.dueDate) : "—"}
              </span>
              <div
                className={styles.listActions}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => openEdit(task)}
                  className={styles.btnAction}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── GANTT ── */}
      {view === "gantt" && taskCount > 0 && (
        <div className={styles.ganttWrapper}>
          <div className={styles.gantt}>
            {/* Header */}
            <div className={styles.ganttHeaderRow}>
              <div className={styles.ganttLabelCol}>Tarea</div>
              <div className={styles.ganttTimeline}>
                {ganttWeeks.map((w, i) => (
                  <div
                    key={i}
                    className={`${styles.ganttWeek} ${w.isThisWeek ? styles.ganttWeekToday : ""}`}
                  >
                    {w.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {tasks.map((task) => {
              const createdMs = task.createdAt
                ? task.createdAt.seconds * 1000
                : Date.now();
              const taskStartMs = Math.max(createdMs, gStart.getTime());
              const taskEndMs = task.dueDate
                ? new Date(task.dueDate + "T23:59:59").getTime()
                : null;

              const leftPct = Math.min(
                100,
                Math.max(
                  0,
                  ((taskStartMs - gStart.getTime()) / gTotal) * 100,
                ),
              );
              const rightPct = taskEndMs
                ? Math.min(
                    100,
                    Math.max(
                      leftPct + 1,
                      ((taskEndMs - gStart.getTime()) / gTotal) * 100,
                    ),
                  )
                : leftPct + 2;
              const widthPct = rightPct - leftPct;

              return (
                <div key={task.id} className={styles.ganttRow}>
                  <div className={styles.ganttRowLabel}>
                    <span
                      className={styles.priorityDot}
                      data-priority={task.priority}
                    />
                    <span
                      className={styles.ganttRowTitle}
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className={styles.ganttTrack}>
                    {/* Week grid lines */}
                    {ganttWeeks.map((w, i) => (
                      <div
                        key={i}
                        className={styles.ganttGridLine}
                        style={{ left: `${(i / GANTT_WEEKS) * 100}%` }}
                      />
                    ))}
                    {/* Today line */}
                    {todayPct >= 0 && todayPct <= 100 && (
                      <div
                        className={styles.ganttTodayLine}
                        style={{ left: `${todayPct}%` }}
                      />
                    )}
                    {/* Task bar */}
                    <div
                      className={styles.ganttBar}
                      data-status={task.status}
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(widthPct, 1)}%`,
                      }}
                      onClick={() => openEdit(task)}
                      title={`${task.title}${task.dueDate ? ` · vence ${formatDate(task.dueDate)}` : ""}`}
                    >
                      {widthPct > 5 && (
                        <span className={styles.ganttBarLabel}>
                          {task.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLabel}>
            {editingTask ? "Editar tarea" : "Nueva tarea"}
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            className={styles.drawerClose}
          >
            <X width={16} height={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="taskTitle" className={styles.label}>
              Título *
            </label>
            <input
              ref={titleRef}
              id="taskTitle"
              name="title"
              type="text"
              value={form.title}
              onChange={handleField}
              className={styles.input}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="taskDesc" className={styles.label}>
              Descripción
            </label>
            <textarea
              id="taskDesc"
              name="description"
              value={form.description}
              onChange={handleField}
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="taskStatus" className={styles.label}>
                Estado
              </label>
              <select
                id="taskStatus"
                name="status"
                value={form.status}
                onChange={handleField}
                className={styles.input}
              >
                {COLUMNS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="taskPriority" className={styles.label}>
                Prioridad
              </label>
              <select
                id="taskPriority"
                name="priority"
                value={form.priority}
                onChange={handleField}
                className={styles.input}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="taskDue" className={styles.label}>
              Fecha de vencimiento
            </label>
            <input
              id="taskDue"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleField}
              className={styles.input}
            />
          </div>

          <div className={styles.formActions}>
            <div>
              {editingTask && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className={styles.btnDelete}
                >
                  {confirmDelete ? "¿Eliminar?" : "Eliminar"}
                </button>
              )}
            </div>
            <div className={styles.formActionsRight}>
              <button
                type="button"
                onClick={closeDrawer}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !form.title.trim()}
                className={styles.btnSave}
              >
                {saving
                  ? "Guardando…"
                  : editingTask
                    ? "Guardar"
                    : "Crear tarea"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}

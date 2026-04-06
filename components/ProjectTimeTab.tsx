"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDuration, formatElapsed, useTimer } from "@/lib/timerContext";
import {
  deleteTimeEntry,
  subscribeToTimeEntries,
  type TimeEntry,
} from "@/lib/timeEntries";
import styles from "@/styles/intranet-timer.module.css";

type Props = {
  projectId: string;
  projectName: string;
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayLabel(dateStr: string): string {
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  if (dateStr === today) return "Hoy";
  if (dateStr === yesterday) return "Ayer";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function timeLabel(ts: { seconds: number }): string {
  return new Date(ts.seconds * 1000).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectTimeTab({ projectId, projectName }: Props) {
  const { activeTimer, elapsed, start, stop } = useTimer();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<string | null>(null);

  const isThisProject = activeTimer?.projectId === projectId;
  const otherProjectActive =
    activeTimer !== null && activeTimer.projectId !== projectId;

  useEffect(() => {
    const unsub = subscribeToTimeEntries(projectId, setEntries);
    return unsub;
  }, [projectId]);

  // Totals
  const totalSeconds = useMemo(
    () => entries.reduce((acc, e) => acc + e.durationSeconds, 0),
    [entries],
  );

  const weekSeconds = useMemo(() => {
    const weekStart = Date.now() - 7 * 24 * 3600 * 1000;
    return entries
      .filter((e) => e.startedAt.seconds * 1000 >= weekStart)
      .reduce((acc, e) => acc + e.durationSeconds, 0);
  }, [entries]);

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    for (const entry of entries) {
      const key = dayKey(new Date(entry.startedAt.seconds * 1000));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  }, [entries]);

  // Weekly bar chart — last 7 days
  const weekDays = useMemo(() => {
    const days: { label: string; key: string; seconds: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = dayKey(d);
      const dayTotal = (grouped.get(key) ?? []).reduce(
        (acc, e) => acc + e.durationSeconds,
        0,
      );
      days.push({
        label: d.toLocaleDateString("es-ES", { weekday: "short" }),
        key,
        seconds: dayTotal,
      });
    }
    return days;
  }, [grouped]);

  const maxDaySeconds = Math.max(...weekDays.map((d) => d.seconds), 1);

  return (
    <div className={styles.container}>
      {/* Timer control */}
      <div className={styles.timerControl}>
        {isThisProject ? (
          <div className={styles.runningBlock}>
            <span className={styles.runningDot} />
            <span className={styles.runningLabel}>En curso</span>
            <span className={styles.runningElapsed}>{formatElapsed(elapsed)}</span>
            <button
              type="button"
              onClick={() => void stop()}
              className={styles.btnStop}
            >
              ■ Detener sesión
            </button>
          </div>
        ) : (
          <div className={styles.idleBlock}>
            {otherProjectActive && (
              <p className={styles.otherActive}>
                Timer activo en <strong>{activeTimer?.projectName}</strong>. Detenlo primero.
              </p>
            )}
            <button
              type="button"
              onClick={() => start(projectId, projectName)}
              disabled={otherProjectActive}
              className={styles.btnPlay}
            >
              ▶ Iniciar sesión
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total acumulado</span>
          <span className={styles.summaryValue}>
            {totalSeconds > 0 ? formatDuration(totalSeconds) : "—"}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Esta semana</span>
          <span className={styles.summaryValue}>
            {weekSeconds > 0 ? formatDuration(weekSeconds) : "—"}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Sesiones</span>
          <span className={styles.summaryValue}>{entries.length}</span>
        </div>
      </div>

      {/* Weekly chart */}
      <div className={styles.chartBlock}>
        <span className={styles.chartTitle}>Últimos 7 días</span>
        <div className={styles.chart}>
          {weekDays.map((day) => (
            <div key={day.key} className={styles.chartBar}>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${(day.seconds / maxDaySeconds) * 100}%`,
                  }}
                  data-active={dayKey(new Date()) === day.key ? "true" : "false"}
                />
              </div>
              <span className={styles.barLabel}>{day.label}</span>
              {day.seconds > 0 && (
                <span className={styles.barValue}>
                  {formatDuration(day.seconds)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Session history */}
      {entries.length > 0 && (
        <div className={styles.historyBlock}>
          <span className={styles.historyTitle}>Historial</span>
          {Array.from(grouped.entries()).map(([key, dayEntries]) => (
            <div key={key} className={styles.dayGroup}>
              <span className={styles.dayLabel}>{dayLabel(key)}</span>
              <div className={styles.sessionList}>
                {dayEntries.map((entry) => (
                  <div key={entry.id} className={styles.sessionRow}>
                    <span className={styles.sessionTime}>
                      {timeLabel(entry.startedAt)} → {timeLabel(entry.endedAt)}
                    </span>
                    <span className={styles.sessionDuration}>
                      {formatDuration(entry.durationSeconds)}
                    </span>
                    <button
                      type="button"
                      className={`${styles.btnDeleteEntry} ${confirmDeleteEntry === entry.id ? styles.btnDeleteEntryConfirm : ""}`}
                      onClick={() => {
                        if (confirmDeleteEntry === entry.id) {
                          void deleteTimeEntry(entry.id);
                          setConfirmDeleteEntry(null);
                        } else {
                          setConfirmDeleteEntry(entry.id);
                        }
                      }}
                      onBlur={() => setConfirmDeleteEntry(null)}
                      title="Eliminar sesión"
                    >
                      {confirmDeleteEntry === entry.id ? "¿Seguro?" : "×"}
                    </button>
                  </div>
                ))}
                <div className={styles.dayTotal}>
                  <span>Total del día</span>
                  <span>
                    {formatDuration(
                      dayEntries.reduce((a, e) => a + e.durationSeconds, 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && !isThisProject && (
        <p className={styles.empty}>
          Inicia una sesión para empezar a registrar tiempo en este proyecto.
        </p>
      )}
    </div>
  );
}

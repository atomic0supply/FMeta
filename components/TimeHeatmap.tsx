"use client";

import { useMemo } from "react";
import type { TimeEntry } from "@/lib/timeEntries";
import styles from "@/styles/intranet-heatmap.module.css";

const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const WEEKS = 52;
// Each week column = 11px cell + 3px gap = 14px
const WEEK_PX = 14;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getLevel(seconds: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds === 0) return 0;
  if (seconds < 3600) return 1;   // < 1h
  if (seconds < 7200) return 2;   // 1–2h
  if (seconds < 14400) return 3;  // 2–4h
  return 4;                        // 4h+
}

type DayCell = {
  date: Date;
  key: string;
  isFuture: boolean;
};

type MonthLabel = {
  label: string;
  weekIndex: number;
};

function buildGrid(): { weeks: DayCell[][]; monthLabels: MonthLabel[] } {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  // Find this week's Monday
  const dow = now.getDay(); // 0=Sun
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMon = new Date(now.getTime() - daysToMon * DAY_MS);
  thisMon.setHours(0, 0, 0, 0);

  // Grid starts 51 weeks before this Monday
  const gridStart = new Date(thisMon.getTime() - (WEEKS - 1) * WEEK_MS);

  const weeks: DayCell[][] = [];
  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;

  for (let w = 0; w < WEEKS; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart.getTime() + (w * 7 + d) * DAY_MS);
      date.setHours(12, 0, 0, 0);
      const isFuture = date > now;
      week.push({ date, key: dayKey(date), isFuture });
    }
    weeks.push(week);

    // Month label at first visible day of month within this week
    const firstDay = week[0].date;
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        label: firstDay.toLocaleDateString("es-ES", { month: "short" }),
        weekIndex: w,
      });
      lastMonth = month;
    }
  }

  return { weeks, monthLabels };
}

type Props = {
  entries: TimeEntry[];
};

export function TimeHeatmap({ entries }: Props) {
  const { weeks, monthLabels } = useMemo(() => buildGrid(), []);

  const dayMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      const key = dayKey(new Date(e.startedAt.seconds * 1000));
      map.set(key, (map.get(key) ?? 0) + e.durationSeconds);
    }
    return map;
  }, [entries]);

  const today = dayKey(new Date());

  const DAY_LABELS = ["L", "", "X", "", "V", "", "D"];

  return (
    <div className={styles.wrapper}>
      {/* Month labels */}
      <div className={styles.monthRow}>
        <div className={styles.monthLabelsContainer}>
          {monthLabels.map((ml, i) => (
            <span
              key={i}
              className={styles.monthLabel}
              style={{ left: `${ml.weekIndex * WEEK_PX}px` }}
            >
              {ml.label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={styles.gridRow}>
        {/* Day labels */}
        <div className={styles.dayLabels}>
          {DAY_LABELS.map((label, i) => (
            <span key={i} className={styles.dayLabel}>
              {label}
            </span>
          ))}
        </div>

        {/* Week columns */}
        <div className={styles.weeksContainer}>
          {weeks.map((week, wi) => (
            <div key={wi} className={styles.weekCol}>
              {week.map((day) => {
                const sec = dayMap.get(day.key) ?? 0;
                const level = day.isFuture ? "future" : getLevel(sec);
                const isToday = day.key === today;

                const hours = sec > 0 ? (Math.round(sec / 360) / 10).toFixed(1) : null;
                const dateStr = day.date.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const tooltip = day.isFuture
                  ? undefined
                  : hours
                  ? `${dateStr} · ${hours}h`
                  : dateStr;

                return (
                  <div
                    key={day.key}
                    className={`${styles.cell} ${isToday ? styles.cellToday : ""}`}
                    data-level={level}
                    title={tooltip}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendText}>Menos</span>
        {([0, 1, 2, 3, 4] as const).map((l) => (
          <div
            key={l}
            className={`${styles.cell} ${styles.legendCell}`}
            data-level={l}
          />
        ))}
        <span className={styles.legendText}>Más</span>
      </div>
    </div>
  );
}

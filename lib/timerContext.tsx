"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { saveTimeEntry } from "@/lib/timeEntries";

const STORAGE_KEY = "roqueta_timer";

type ActiveTimer = {
  projectId: string;
  projectName: string;
  startedAt: number; // Date.now() ms
};

type TimerContextValue = {
  activeTimer: ActiveTimer | null;
  elapsed: number; // seconds
  start: (projectId: string, projectName: string) => void;
  stop: () => Promise<void>;
};

const TimerContext = createContext<TimerContextValue>({
  activeTimer: null,
  elapsed: 0,
  start: () => {},
  stop: async () => {},
});

export function useTimer() {
  return useContext(TimerContext);
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveTimer;
        if (parsed.projectId && parsed.startedAt) {
          setActiveTimer(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Tick every second when active
  useEffect(() => {
    if (!activeTimer) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
      return;
    }

    setElapsed(Math.floor((Date.now() - activeTimer.startedAt) / 1000));

    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTimer.startedAt) / 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer]);

  const start = useCallback((projectId: string, projectName: string) => {
    const timer: ActiveTimer = { projectId, projectName, startedAt: Date.now() };
    setActiveTimer(timer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
  }, []);

  const stop = useCallback(async () => {
    if (!activeTimer) return;
    const endedAt = Date.now();
    const snapshot = { ...activeTimer };
    setActiveTimer(null);
    localStorage.removeItem(STORAGE_KEY);
    await saveTimeEntry(
      snapshot.projectId,
      snapshot.projectName,
      snapshot.startedAt,
      endedAt,
    );
  }, [activeTimer]);

  return (
    <TimerContext.Provider value={{ activeTimer, elapsed, start, stop }}>
      {children}
    </TimerContext.Provider>
  );
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { auth } from "@/lib/firebase";
import { saveTimeEntry } from "@/lib/timeEntries";

const STORAGE_KEY = "roqueta_timer";

type ActiveTimer = {
  projectId: string;
  projectName: string;
  startedAt: number;
};

type TimerContextValue = {
  activeTimer: ActiveTimer | null;
  elapsed: number;
  pendingStop: boolean;
  start: (projectId?: string, projectName?: string) => void;
  stop: () => void;
  confirmStop: (notes: string, projectId: string, projectName: string) => Promise<void>;
  cancelStop: () => void;
};

const TimerContext = createContext<TimerContextValue>({
  activeTimer: null,
  elapsed: 0,
  pendingStop: false,
  start: () => {},
  stop: () => {},
  confirmStop: async () => {},
  cancelStop: () => {},
});

export function useTimer() {
  return useContext(TimerContext);
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [pendingStop, setPendingStop] = useState(false);
  const pendingTimerRef = useRef<ActiveTimer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveTimer;
        if (parsed.projectId && parsed.startedAt) setActiveTimer(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

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

  const start = useCallback((projectId = "", projectName = "") => {
    const timer: ActiveTimer = { projectId, projectName, startedAt: Date.now() };
    setActiveTimer(timer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
  }, []);

  const stop = useCallback(() => {
    if (!activeTimer) return;
    pendingTimerRef.current = { ...activeTimer };
    setPendingStop(true);
  }, [activeTimer]);

  const confirmStop = useCallback(async (notes: string, projectId: string, projectName: string) => {
    const snapshot = pendingTimerRef.current;
    if (!snapshot) return;
    const endedAt = Date.now();
    const userId = auth?.currentUser?.uid;
    const userDisplayName = auth?.currentUser?.displayName ?? auth?.currentUser?.email ?? undefined;
    setPendingStop(false);
    pendingTimerRef.current = null;
    setActiveTimer(null);
    localStorage.removeItem(STORAGE_KEY);
    await saveTimeEntry(projectId, projectName, snapshot.startedAt, endedAt, notes, userId, userDisplayName);
  }, []);

  const cancelStop = useCallback(() => {
    pendingTimerRef.current = null;
    setPendingStop(false);
  }, []);

  return (
    <TimerContext.Provider
      value={{ activeTimer, elapsed, pendingStop, start, stop, confirmStop, cancelStop }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

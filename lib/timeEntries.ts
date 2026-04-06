import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type Unsubscribe,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type TimeEntry = {
  id: string;
  projectId: string;
  projectName: string;
  startedAt: Timestamp;
  endedAt: Timestamp;
  durationSeconds: number;
  notes?: string;
};

export function subscribeToTimeEntries(
  projectId: string,
  callback: (entries: TimeEntry[]) => void,
): Unsubscribe {
  if (!db) return () => {};
  const q = query(
    collection(db, "timeEntries"),
    where("projectId", "==", projectId),
    orderBy("startedAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<TimeEntry, "id">),
    }));
    callback(entries);
  });
}

export function subscribeToAllTimeEntries(
  callback: (entries: TimeEntry[]) => void,
  limitDays = 90,
): Unsubscribe {
  if (!db) return () => {};
  const since = Timestamp.fromMillis(Date.now() - limitDays * 86400000);
  const q = query(
    collection(db, "timeEntries"),
    where("startedAt", ">=", since),
    orderBy("startedAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<TimeEntry, "id">),
    }));
    callback(entries);
  });
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await deleteDoc(doc(db, "timeEntries", entryId));
}

export async function saveTimeEntry(
  projectId: string,
  projectName: string,
  startedAtMs: number,
  endedAtMs: number,
  notes?: string,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  const durationSeconds = Math.round((endedAtMs - startedAtMs) / 1000);
  if (durationSeconds < 5) return;
  await addDoc(collection(db, "timeEntries"), {
    projectId,
    projectName,
    startedAt: Timestamp.fromMillis(startedAtMs),
    endedAt: Timestamp.fromMillis(endedAtMs),
    durationSeconds,
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
  });
}

export function exportTimeEntriesToCsv(entries: TimeEntry[]): void {
  const fmt = (ts: Timestamp) => new Date(ts.seconds * 1000);
  const rows: string[][] = [
    ["Proyecto", "Fecha", "Inicio", "Fin", "Duración (min)", "Notas"],
    ...entries.map((e) => [
      e.projectName,
      fmt(e.startedAt).toLocaleDateString("es-ES"),
      fmt(e.startedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      fmt(e.endedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      Math.round(e.durationSeconds / 60).toString(),
      e.notes ?? "",
    ]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tiempo-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

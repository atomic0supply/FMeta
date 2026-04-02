import {
  addDoc,
  collection,
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

export async function saveTimeEntry(
  projectId: string,
  projectName: string,
  startedAtMs: number,
  endedAtMs: number,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");

  const durationSeconds = Math.round((endedAtMs - startedAtMs) / 1000);
  if (durationSeconds < 5) return; // ignore accidental sub-5s sessions

  await addDoc(collection(db, "timeEntries"), {
    projectId,
    projectName,
    startedAt: Timestamp.fromMillis(startedAtMs),
    endedAt: Timestamp.fromMillis(endedAtMs),
    durationSeconds,
  });
}

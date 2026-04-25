import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type ActivityEventType =
  | "task_moved"
  | "task_created"
  | "project_created"
  | "project_updated"
  | "time_saved"
  | "comment_added";

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  actorUid: string;
  actorName: string;
  projectId: string;
  projectName: string;
  payload: {
    from?: string;
    to?: string;
    taskTitle?: string;
    durationSeconds?: number;
  };
  createdAt: Timestamp | null;
};

type ActivityInput = Omit<ActivityEvent, "id" | "createdAt">;

export async function logActivity(event: ActivityInput): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, "activityLog"), {
      ...event,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-critical: don't block main operation if logging fails
  }
}

export function subscribeToRecentActivity(
  callback: (events: ActivityEvent[]) => void,
  maxResults = 20,
): Unsubscribe {
  if (!db) return () => {};
  const q = query(
    collection(db, "activityLog"),
    orderBy("createdAt", "desc"),
    limit(maxResults),
  );
  return onSnapshot(q, (snap) => {
    const events = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ActivityEvent, "id">),
    }));
    callback(events);
  });
}

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type TaskComment = {
  id: string;
  text: string;
  authorUid: string;
  authorDisplayName: string;
  createdAt: Timestamp | null;
};

export function subscribeToComments(
  projectId: string,
  taskId: string,
  callback: (comments: TaskComment[]) => void,
): Unsubscribe {
  if (!db) return () => {};
  const q = query(
    collection(db, "projects", projectId, "tasks", taskId, "comments"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<TaskComment, "id">),
    }));
    callback(comments);
  });
}

export async function addComment(
  projectId: string,
  taskId: string,
  text: string,
  authorUid: string,
  authorDisplayName: string,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await addDoc(
    collection(db, "projects", projectId, "tasks", taskId, "comments"),
    {
      text: text.trim(),
      authorUid,
      authorDisplayName,
      createdAt: serverTimestamp(),
    },
  );
}

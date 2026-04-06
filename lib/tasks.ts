import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // "YYYY-MM-DD" or ""
  order: number;
  createdAt: Timestamp | null;
};

export type TaskInput = Omit<Task, "id" | "createdAt">;

export function subscribeToTasks(
  projectId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  if (!db) return () => {};
  const q = query(
    collection(db, "projects", projectId, "tasks"),
    orderBy("order", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Task, "id">),
    }));
    callback(tasks);
  });
}

export async function createTask(
  projectId: string,
  data: TaskInput,
): Promise<string> {
  if (!db) throw new Error("Firebase no disponible");
  const ref = await addDoc(collection(db, "projects", projectId, "tasks"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<TaskInput>,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await updateDoc(doc(db, "projects", projectId, "tasks", taskId), data);
}

export async function deleteTask(
  projectId: string,
  taskId: string,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
}

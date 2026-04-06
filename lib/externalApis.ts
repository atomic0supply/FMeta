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

export type ApiEnvironment = "prod" | "test" | "dev";

export type ExternalApi = {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  docUrl: string;
  environment: ApiEnvironment;
  notes: string;
  createdAt: Timestamp | null;
};

export type ExternalApiInput = Omit<ExternalApi, "id" | "createdAt">;

export function subscribeToExternalApis(
  projectId: string,
  callback: (apis: ExternalApi[]) => void,
): Unsubscribe {
  if (!db) return () => {};
  const q = query(
    collection(db, "projects", projectId, "externalApis"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const apis = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ExternalApi, "id">),
    }));
    callback(apis);
  });
}

export async function createExternalApi(
  projectId: string,
  data: ExternalApiInput,
): Promise<string> {
  if (!db) throw new Error("Firebase no disponible");
  const ref = await addDoc(
    collection(db, "projects", projectId, "externalApis"),
    { ...data, createdAt: serverTimestamp() },
  );
  return ref.id;
}

export async function updateExternalApi(
  projectId: string,
  apiId: string,
  data: Partial<ExternalApiInput>,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await updateDoc(
    doc(db, "projects", projectId, "externalApis", apiId),
    data,
  );
}

export async function deleteExternalApi(
  projectId: string,
  apiId: string,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await deleteDoc(doc(db, "projects", projectId, "externalApis", apiId));
}

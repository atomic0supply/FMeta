import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type Client = {
  id: string;
  name: string;
  sector: string;
  contact: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: Timestamp | null;
};

export type ClientInput = Omit<Client, "id" | "createdAt">;

export function subscribeToClients(
  callback: (clients: Client[]) => void,
): Unsubscribe {
  if (!db) return () => {};

  const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const clients = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Client, "id">),
    }));
    callback(clients);
  });
}

export async function getClient(id: string): Promise<Client | null> {
  if (!db) return null;

  const snap = await getDoc(doc(db, "clients", id));
  if (!snap.exists()) return null;

  return { id: snap.id, ...(snap.data() as Omit<Client, "id">) };
}

export async function createClient(data: ClientInput): Promise<string> {
  if (!db) throw new Error("Firebase no disponible");

  const ref = await addDoc(collection(db, "clients"), {
    ...data,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateClient(
  id: string,
  data: Partial<ClientInput>,
): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await updateDoc(doc(db, "clients", id), data);
}

export async function deleteClient(id: string): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await deleteDoc(doc(db, "clients", id));
}

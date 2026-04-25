import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { UserRole } from "@/lib/users";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  active: boolean;
  createdAt: { seconds: number } | null;
};

export function subscribeToAllUsers(
  callback: (users: UserProfile[]) => void,
): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, "users"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<UserProfile, "uid">),
    }));
    callback(users);
  });
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await updateDoc(doc(db, "users", uid), { role });
}

export async function setUserActive(uid: string, active: boolean): Promise<void> {
  if (!db) throw new Error("Firebase no disponible");
  await updateDoc(doc(db, "users", uid), { active });
}

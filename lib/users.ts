import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

export type UserRole = "admin" | "team";

type EnsureUserArgs = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: UserRole;
};

export async function ensureUserProfile({
  uid,
  email,
  displayName,
  role = "team",
}: EnsureUserArgs) {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, "users", uid),
    {
      email,
      role,
      displayName,
      active: true,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

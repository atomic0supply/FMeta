"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import type { UserRole } from "@/lib/users";

export type CurrentUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  active: boolean;
  geminiApiKey?: string;
};

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !db) {
        setUser(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const data = snap.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName ?? data?.displayName ?? null,
          role: (data?.role as UserRole) ?? "team",
          active: data?.active ?? true,
          geminiApiKey:
            typeof data?.geminiApiKey === "string" ? data.geminiApiKey : "",
        });
      } catch {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: "team",
          active: true,
          geminiApiKey: "",
        });
      }
    });
    return unsub;
  }, []);

  return user;
}

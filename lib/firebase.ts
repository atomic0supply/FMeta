import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDWcmHhiTQJMMHCJH5aTl0o_8YtYzCTLvU",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "fmeta-f9aed.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "fmeta-f9aed",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "fmeta-f9aed.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1031166438775",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:1031166438775:web:01d4d39be4c9b11d69c572",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-LCE6G5P6E1",
};

export const firebaseEnabled = Object.values(firebaseConfig).every(Boolean);

export const app = firebaseEnabled
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

let analyticsStarted = false;

export async function ensureAuthPersistence() {
  if (!auth) {
    return;
  }

  await setPersistence(auth, browserLocalPersistence);
}

export async function ensureAnalytics() {
  if (!app || analyticsStarted || typeof window === "undefined") {
    return null;
  }

  const analyticsSupported = await isSupported();
  if (!analyticsSupported) {
    return null;
  }

  analyticsStarted = true;
  return getAnalytics(app);
}

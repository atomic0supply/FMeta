"use client";

const COOKIE_NAME = "formeta_session";
const MAX_AGE = 60 * 60 * 8;

export function setSessionCookie(uid: string) {
  document.cookie = `${COOKIE_NAME}=${uid}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function clearSessionCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

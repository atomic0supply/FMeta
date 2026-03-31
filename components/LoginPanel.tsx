"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState, useTransition } from "react";
import {
  signInWithEmailAndPassword,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
} from "firebase/auth";

import { auth, ensureAuthPersistence, firebaseEnabled } from "@/lib/firebase";
import { setSessionCookie } from "@/lib/session";
import { ensureUserProfile } from "@/lib/users";
import styles from "@/styles/auth.module.css";

type LoginPanelProps = {
  redirect?: string;
};

export function LoginPanel({ redirect = "/intranet" }: LoginPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const syncCurrentSession = useCallback(async () => {
    if (!auth?.currentUser) {
      return;
    }

    setSessionCookie(auth.currentUser.uid);
    await ensureUserProfile({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
    });
    router.replace(redirect);
    router.refresh();
  }, [redirect, router]);

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!firebaseEnabled || !auth) {
      setError("Configura Firebase en .env.local para activar el acceso.");
      return;
    }

    const firebaseAuth = auth;

    startTransition(async () => {
      try {
        await ensureAuthPersistence();
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        await syncCurrentSession();
      } catch {
        setError("No se ha podido iniciar sesión con esas credenciales.");
      }
    });
  }

  async function handleMagicLink() {
    setError(null);
    setMessage(null);

    if (!firebaseEnabled || !auth) {
      setError("Configura Firebase en .env.local para activar el acceso.");
      return;
    }

    const firebaseAuth = auth;

    startTransition(async () => {
      try {
        await ensureAuthPersistence();
        await sendSignInLinkToEmail(firebaseAuth, email, {
          url: `${window.location.origin}/login?redirect=${encodeURIComponent(redirect)}`,
          handleCodeInApp: true,
        });
        window.localStorage.setItem("formeta_email", email);
        setMessage("Enlace enviado. Revisa tu correo para completar el acceso.");
      } catch {
        setError("No se ha podido enviar el magic link.");
      }
    });
  }

  useEffect(() => {
    async function completeEmailLink() {
      if (!auth || !isSignInWithEmailLink(auth, window.location.href)) {
        return;
      }

      const storedEmail = window.localStorage.getItem("formeta_email");
      if (!storedEmail) {
        setMessage("Introduce tu correo para completar el acceso desde el enlace.");
        return;
      }

      try {
        await ensureAuthPersistence();
        await signInWithEmailLink(auth, storedEmail, window.location.href);
        window.localStorage.removeItem("formeta_email");
        await syncCurrentSession();
      } catch {
        setError("El enlace no es válido o ya ha expirado.");
      }
    }

    void completeEmailLink();
  }, [syncCurrentSession]);

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <p className={styles.kicker}>ForMeta Intranet</p>
        <h1>Acceso privado</h1>
        <p className={styles.copy}>
          Entrada discreta a un sistema interno pensado para operar con la misma
          claridad que la marca.
        </p>
      </div>

      <form className={styles.form} onSubmit={handlePasswordSignIn}>
        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="equipo@formeta.es"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button type="submit" disabled={isPending}>
            {isPending ? "Accediendo..." : "Entrar"}
          </button>
          <button
            type="button"
            disabled={isPending || !email}
            onClick={() => void handleMagicLink()}
            className={styles.secondary}
          >
            Enviar magic link
          </button>
        </div>
      </form>

      {(message || error) && (
        <p className={error ? styles.error : styles.message}>{error ?? message}</p>
      )}

      <div className={styles.metaRow}>
        <p>Roles previstos: `admin` y `team`.</p>
        <Link href="/">Volver a la web pública</Link>
      </div>
    </section>
  );
}

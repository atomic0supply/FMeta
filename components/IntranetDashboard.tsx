"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { clearSessionCookie } from "@/lib/session";
import styles from "@/styles/intranet-dashboard.module.css";

const modules = [
  "Operaciones y seguimiento de proyectos",
  "Biblioteca documental y memoria interna",
  "Automatizaciones y flujos AI-first",
];

export function IntranetDashboard() {
  const router = useRouter();

  async function handleSignOut() {
    if (auth) {
      await signOut(auth);
    }

    clearSessionCookie();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>ForMeta Intranet</p>
          <h1>Base privada operativa</h1>
        </div>
        <div className={styles.actions}>
          <Link href="/">Web pública</Link>
          <button type="button" onClick={() => void handleSignOut()}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.label}>Estado</p>
          <h2>Acceso concedido y estructura lista para crecer.</h2>
        </div>
        <p>
          Esta primera versión deja preparado el espacio interno con autenticación,
          cookie de sesión y una base sencilla para módulos privados.
        </p>
      </section>

      <section className={styles.grid}>
        {modules.map((module) => (
          <article key={module} className={styles.card}>
            <span>Próximo módulo</span>
            <h3>{module}</h3>
            <p>Placeholder estructural para la siguiente iteración de la intranet.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

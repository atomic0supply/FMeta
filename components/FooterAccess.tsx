import Link from "next/link";

import styles from "@/styles/footer-access.module.css";

export function FooterAccess() {
  return (
    <footer className={styles.footer}>
      <div>
        <p className={styles.kicker}>ForMeta · Mallorca · 2026</p>
        <p className={styles.note}>Software específico, sistemas AI-first e infraestructura sobria.</p>
      </div>
      <div className={styles.right}>
        <span className={styles.lema}>Forma Latente</span>
        <Link href="/login" className={styles.access}>
          FM/INT
        </Link>
      </div>
    </footer>
  );
}

import styles from "@/styles/site-header.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.wordmark} href="#top" aria-label="ForMeta">
        <span>For</span>
        <em>Meta</em>
      </a>
      <nav className={styles.nav} aria-label="Principal">
        <a href="#identidad">Identidad</a>
        <a href="#servicios">Servicios</a>
        <a href="#iapps">IApps</a>
        <a href="#contacto" className={styles.cta}>Contacto</a>
      </nav>
    </header>
  );
}

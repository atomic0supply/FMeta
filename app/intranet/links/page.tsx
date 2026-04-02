import styles from "@/styles/intranet-placeholder.module.css";

export const metadata = {
  title: "Links — Roqueta",
};

export default function LinksPage() {
  return (
    <main className={styles.page}>
      <p className={styles.kicker}>Accesos rápidos</p>
      <h1 className={styles.title}>Links</h1>
      <p className={styles.lead}>
        Herramientas externas, dashboards y recursos organizados por categoría.
        Módulo en construcción.
      </p>
    </main>
  );
}

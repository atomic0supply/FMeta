import styles from "@/styles/capabilities-grid.module.css";

const items = [
  {
    index: "01",
    title: "Software específico",
    body: "Aplicaciones diseñadas para un problema concreto, sin capas heredadas de producto genérico.",
  },
  {
    index: "02",
    title: "Integración con AI",
    body: "Modelos conectados al flujo real de trabajo, con utilidad operativa desde el inicio.",
  },
  {
    index: "03",
    title: "Infraestructura sobria",
    body: "Google Cloud y Firebase como base ligera para operar con continuidad, seguridad y criterio.",
  },
];

export function CapabilitiesGrid() {
  return (
    <section className={styles.section} id="servicios">
      <div className={styles.heading}>
        <p className={styles.label}>02 — Servicios</p>
        <h2>Servicios pensados para problemas que no admiten plantilla.</h2>
      </div>
      <div className={styles.grid}>
        {items.map((item) => (
          <article key={item.index} className={styles.card}>
            <span className={styles.index}>{item.index}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

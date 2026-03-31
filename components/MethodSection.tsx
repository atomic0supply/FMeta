import styles from "@/styles/method-section.module.css";

const pillars = [
  "Reducción antes que exceso.",
  "Estructura antes que decoración.",
  "Claridad operativa antes que espectáculo.",
];

export function MethodSection() {
  return (
    <section className={styles.section} id="identidad">
      <div className={styles.intro}>
        <p className={styles.label}>01 — Identidad</p>
        <h2>La forma no es ornamento. Es estructura.</h2>
      </div>
      <div className={styles.layout}>
        <p className={styles.copy}>
          ForMeta nace de “formita”: dar forma con precisión. El término aparece
          una sola vez porque basta para explicar la idea central de la marca:
          reducir hasta dejar solo lo necesario y convertir esa claridad en
          software mantenible.
        </p>
        <div className={styles.pillars}>
          {pillars.map((pillar) => (
            <div key={pillar} className={styles.pillar}>
              {pillar}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

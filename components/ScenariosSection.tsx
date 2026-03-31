import styles from "@/styles/scenarios-section.module.css";

const scenarios = [
  {
    title: "Operaciones dispersas",
    text: "Unificar datos, decisiones y acciones en un sistema legible para el equipo y útil para la dirección.",
  },
  {
    title: "Procesos expertos",
    text: "Modelar criterio interno para que el software pueda asistir, proponer y ejecutar con contexto real.",
  },
  {
    title: "Herramientas internas",
    text: "Sustituir hojas, mensajes y tareas invisibles por una intranet que consolide operación y memoria.",
  },
];

export function ScenariosSection() {
  return (
    <section className={styles.section} id="iapps">
      <div className={styles.side}>
        <p className={styles.label}>03 — IApps</p>
        <h2>Aplicaciones donde la inteligencia no se añade: organiza la lógica.</h2>
      </div>
      <div className={styles.stack}>
        {scenarios.map((scenario) => (
          <article key={scenario.title} className={styles.item}>
            <h3>{scenario.title}</h3>
            <p>{scenario.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

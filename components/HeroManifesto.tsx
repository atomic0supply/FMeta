import styles from "@/styles/hero-manifesto.module.css";

export function HeroManifesto() {
  return (
    <div className={styles.hero}>
      <p className={styles.eyebrow}>Mallorca · Software a medida · AI aplicada</p>
      <h1>
        Dar forma
        <br />
        a sistemas
        <br />
        bien resueltos.
      </h1>
      <p className={styles.copy}>
        Software específico, estructura clara e inteligencia aplicada para
        organizaciones que no encajan en herramientas genéricas.
      </p>
      <div className={styles.actions}>
        <a href="#contacto" className={styles.primary}>
          Hablar de un proyecto
        </a>
        <span className={styles.meta}>Forma Latente · calma técnica</span>
      </div>
    </div>
  );
}

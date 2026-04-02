import { Reveal } from "@/components/Reveal";
import styles from "@/styles/hero-manifesto.module.css";

export function HeroManifesto() {
  return (
    <div className={styles.hero}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Mallorca · Software a medida · AI aplicada</p>
        <h1>
          Software con <em>forma</em>
          <br />propia para
          <br />operaciones reales.
        </h1>
        <p className={styles.copy}>
          Diseñamos sistemas digitales para empresas que necesitan claridad
          operativa, integración real y una herramienta hecha para su manera de
          trabajar, no para una media de mercado.
        </p>
      </div>

      <Reveal className={styles.actions} delay={240}>
        <a href="#contacto" className={styles.primary}>
          Explicar vuestro caso
        </a>
        <span className={styles.meta}>Software, estructura e IA sin ruido</span>
      </Reveal>
    </div>
  );
}

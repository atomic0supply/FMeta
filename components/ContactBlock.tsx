import styles from "@/styles/contact-block.module.css";

export function ContactBlock() {
  return (
    <section className={styles.section} id="contacto">
      <div>
        <p className={styles.label}>04 — Contacto</p>
        <h2>
          Si el proyecto pide
          <br />
          precisión, conversemos.
        </h2>
      </div>
      <div className={styles.panel}>
        <p>
          ForMeta trabaja con pocas colaboraciones a la vez. La conversación
          inicial sirve para decidir si hay una estructura real que merezca
          convertirse en sistema.
        </p>
        <a href="mailto:hola@formeta.es" className={styles.link}>
          hola@formeta.es
        </a>
      </div>
    </section>
  );
}

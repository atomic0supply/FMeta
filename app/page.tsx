import { BrandMark } from "@/components/BrandMark";
import { CapabilitiesGrid } from "@/components/CapabilitiesGrid";
import { ContactBlock } from "@/components/ContactBlock";
import { FooterAccess } from "@/components/FooterAccess";
import { HeroManifesto } from "@/components/HeroManifesto";
import { MethodSection } from "@/components/MethodSection";
import { ScenariosSection } from "@/components/ScenariosSection";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "@/styles/home.module.css";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.heroWrap} id="top">
          <div className={styles.heroGrid}>
            <HeroManifesto />
            <div className={styles.brandColumn}>
              <div className={styles.brandFrame}>
                <BrandMark />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <p>
            ForMeta diseña sistemas digitales con una lógica simple: reducir,
            ordenar y dar forma precisa a lo que una organización realmente
            necesita sostener.
          </p>
        </section>

        <MethodSection />
        <CapabilitiesGrid />
        <ScenariosSection />
        <ContactBlock />
      </main>
      <FooterAccess />
    </>
  );
}

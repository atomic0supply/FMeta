import { LoginPanel } from "@/components/LoginPanel";
import styles from "@/styles/auth.module.css";

export const metadata = {
  title: "Acceso — ForMeta",
  description: "Acceso privado a la intranet de ForMeta.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className={styles.authPage}>
      <div className={styles.backdrop} />
      <LoginPanel redirect={params.redirect} />
    </main>
  );
}

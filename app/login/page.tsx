import { LoginPanel } from "@/components/LoginPanel";
import styles from "@/styles/auth.module.css";

export const metadata = {
  title: "Acceso - Roqueta",
  description: "Acceso privado a la intranet Roqueta de ForMeta.",
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

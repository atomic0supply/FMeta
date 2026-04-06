import { IntranetSidebar } from "@/components/IntranetSidebar";
import { StopModal } from "@/components/StopModal";
import { TimerProvider } from "@/lib/timerContext";
import styles from "@/styles/intranet-layout.module.css";

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TimerProvider>
      <div className={styles.shell}>
        <IntranetSidebar />
        <div className={styles.content}>{children}</div>
      </div>
      <StopModal />
    </TimerProvider>
  );
}

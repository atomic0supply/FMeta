import styles from "@/styles/intranet-skeleton.module.css";

type Props = {
  width?: string;
  height?: string;
  radius?: string;
};

export function SkeletonBlock({ width = "100%", height = "16px", radius = "6px" }: Props) {
  return (
    <div
      className={styles.shimmer}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <SkeletonBlock width="40%" height="10px" radius="4px" />
      <SkeletonBlock width="60%" height="28px" radius="4px" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className={styles.row} aria-hidden="true">
      <SkeletonBlock width="30%" height="12px" />
      <SkeletonBlock width="20%" height="12px" />
      <SkeletonBlock width="15%" height="12px" />
    </div>
  );
}

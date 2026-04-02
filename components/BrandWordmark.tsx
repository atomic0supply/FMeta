import styles from "@/styles/brand-wordmark.module.css";

type BrandWordmarkProps = {
  small?: boolean;
  iconOnly?: boolean;
  animated?: boolean;
};

export function BrandWordmark({
  small = false,
  iconOnly = false,
  animated = false,
}: BrandWordmarkProps) {
  return (
    <span
      className={styles.wordmark}
      data-size={small ? "small" : "default"}
      data-icon-only={iconOnly ? "true" : "false"}
    >
      <svg
        viewBox="0 0 320 296"
        aria-hidden="true"
        className={`${styles.mark} ${animated ? styles.animated : ""}`}
      >
        <path
          d="M 160,68.1 A 80 80 0 1 1 237.1,188.0"
          className={styles.outer}
        />
        <path
          d="M 160,95.1 A 53 53 0 1 1 205.9,184.5"
          className={styles.middle}
        />
        <path
          d="M 160,120.1 A 28 28 0 1 1 183.8,162.0"
          className={styles.inner}
        />
      </svg>
      {!iconOnly && (
        <span className={styles.text}>
          <span>For</span>
          <em>Meta</em>
        </span>
      )}
    </span>
  );
}

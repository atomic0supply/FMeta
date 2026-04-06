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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/simbolo_mono_blanco.svg"
        alt=""
        aria-hidden="true"
        className={`${styles.mark} ${animated ? styles.animated : ""}`}
      />
      {!iconOnly && (
        <span className={styles.text}>
          <span>F</span>
          <em>or</em>
          <span>Meta</span>
        </span>
      )}
    </span>
  );
}

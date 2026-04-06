"use client";

import { useState } from "react";

import styles from "@/styles/brand-mark.module.css";

type BrandMarkProps = {
  size?: "hero" | "header";
  showLabel?: boolean;
};

export function BrandMark({ size = "hero", showLabel = true }: BrandMarkProps) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function updateTilt(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const factor = size === "header" ? 5 : 8;
    setTilt({ x: x * factor, y: y * -factor });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className={styles.shell}
      data-size={size}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        resetTilt();
      }}
      onFocus={() => setHovered(true)}
      onBlur={() => {
        setHovered(false);
        resetTilt();
      }}
      onPointerMove={updateTilt}
      tabIndex={showLabel ? 0 : -1}
      aria-label="Logotipo interactivo de ForMeta"
    >
      <div className={styles.halo} />
      <div
        className={styles.mark}
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/simbolo_color_sand.svg"
          alt=""
          aria-hidden="true"
          className={styles.symbol}
        />
        <svg viewBox="0 0 160 200" aria-hidden="true" className={styles.ecoOverlay}>
          <circle cx="80" cy="130" r="28" className={`${styles.ecoRing} ${hovered ? styles.ecoActive : ""}`} />
        </svg>
      </div>
      {showLabel && (
        <div className={styles.label}>
          <span className={`${styles.fm} ${hovered ? styles.hidden : ""}`}>FM</span>
          <span className={`${styles.name} ${hovered ? styles.visible : ""}`}>
            F<em>or</em>Meta
          </span>
        </div>
      )}
    </div>
  );
}

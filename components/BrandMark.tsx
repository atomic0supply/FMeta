"use client";

import { useState } from "react";

import styles from "@/styles/brand-mark.module.css";

export function BrandMark() {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function updateTilt(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: y * -10 });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className={styles.shell}
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
      tabIndex={0}
      aria-label="Logotipo interactivo de ForMeta"
    >
      <div
        className={styles.mark}
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        <svg viewBox="0 0 440 440" aria-hidden="true">
          <g className={styles.grid}>
            <path d="M44 220H396" />
            <path d="M220 44V396" />
            <path d="M98 98L342 342" />
            <path d="M342 98L98 342" />
          </g>
          <g className={styles.rings}>
            <path d="M220 68a152 152 0 1 1-107.48 44.52" />
            <path d="M220 116a104 104 0 1 1-73.54 30.46" />
            <path d="M220 162a58 58 0 1 1-41 17" />
          </g>
          <g className={styles.axes}>
            <path d="M220 76V364" />
            <path d="M76 220H364" />
          </g>
          <circle cx="220" cy="220" r="6" className={styles.core} />
        </svg>
      </div>
      <div className={styles.label}>
        <span className={`${styles.fm} ${hovered ? styles.hidden : ""}`}>FM</span>
        <span className={`${styles.name} ${hovered ? styles.visible : ""}`}>
          ForMeta
        </span>
      </div>
    </div>
  );
}

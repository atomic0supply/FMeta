"use client";

import { useEffect, useState } from "react";

import styles from "@/styles/brand-mark.module.css";

type BrandMarkProps = {
  size?: "hero" | "header";
  showLabel?: boolean;
};

export function BrandMark({ size = "hero", showLabel = true }: BrandMarkProps) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    let timer = 0;

    const runIntro = () => {
      setIntroDone(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setIntroDone(true);
      }, 2400);
    };

    const replayIntro = () => runIntro();

    runIntro();
    window.addEventListener("formeta:loader-hidden", replayIntro);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("formeta:loader-hidden", replayIntro);
    };
  }, []);

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
        data-intro={introDone ? "done" : "running"}
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        <div className={styles.orbit}>
          <svg viewBox="0 0 320 296" aria-hidden="true">
            <g className={styles.rings}>
              <path pathLength="100" d="M 160,68.1 A 80 80 0 1 1 237.1,188.0" />
              <path pathLength="100" d="M 160,95.1 A 53 53 0 1 1 205.9,184.5" />
              <path pathLength="100" d="M 160,120.1 A 28 28 0 1 1 183.8,162.0" />
            </g>
          </svg>
        </div>
      </div>
      {showLabel && (
        <div className={styles.label}>
          <span className={`${styles.fm} ${hovered ? styles.hidden : ""}`}>FM</span>
          <span className={`${styles.name} ${hovered ? styles.visible : ""}`}>
            ForMeta
          </span>
        </div>
      )}
    </div>
  );
}

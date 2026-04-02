"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/styles/landing-loader.module.css";

type Variant = "1" | "2" | "3";
type Phase = "hidden" | "enter" | "leave";

const durations: Record<Variant, number> = {
  "1": 820,
  "2": 980,
  "3": 2450,
};

const leaveLead: Record<Variant, number> = {
  "1": 220,
  "2": 220,
  "3": 420,
};

export function LandingLoader() {
  const [loaderParam, setLoaderParam] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLoaderParam(params.get("loader"));
  }, []);

  const variant = useMemo<Variant | null>(() => {
    if (loaderParam === "off") {
      return null;
    }

    if (loaderParam === "1" || loaderParam === "2" || loaderParam === "3") {
      return loaderParam;
    }

    // Default home experience: cinematic loader 3.
    return "3";
  }, [loaderParam]);

  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    if (!variant) {
      setPhase("hidden");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hidden");
      return;
    }

    setPhase("enter");
    const duration = durations[variant];
    const leaveMs = Math.max(180, duration - leaveLead[variant]);
    const leaveTimer = window.setTimeout(() => setPhase("leave"), leaveMs);
    const hideTimer = window.setTimeout(() => {
      setPhase("hidden");
      window.dispatchEvent(new Event("formeta:loader-hidden"));
    }, duration);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [variant]);

  if (!variant || phase === "hidden") {
    return null;
  }

  return (
    <div className={styles.shell} data-state={phase} data-variant={variant}>
      <div className={styles.inner}>
        {variant === "1" && (
          <div className={styles.wordmarkWrap}>
            <p className={styles.wordmark}>
              <span>For</span>
              <em>Meta</em>
            </p>
            <div className={styles.rule} />
          </div>
        )}

        {variant === "2" && (
          <div className={styles.orbitalWrap} aria-hidden="true">
            <svg viewBox="0 0 160 160" className={styles.orbitalSvg}>
              <circle cx="80" cy="80" r="58" className={styles.orbStone} />
              <circle cx="80" cy="80" r="41" className={styles.orbTerracotta} />
              <circle cx="80" cy="80" r="25" className={styles.orbSea} />
              <line x1="80" y1="22" x2="80" y2="138" className={styles.orbAxis} />
              <line x1="22" y1="80" x2="138" y2="80" className={styles.orbAxis} />
              <circle cx="80" cy="80" r="3.5" className={styles.orbCore} />
            </svg>
          </div>
        )}

        {variant === "3" && (
          <div className={styles.monoWrap}>
            <p>booting formeta.system</p>
            <p>context layer ..... online</p>
            <p>action layer ...... online</p>
            <p>output layer ...... ready</p>
            <div className={styles.monoRule} />
          </div>
        )}
      </div>
    </div>
  );
}

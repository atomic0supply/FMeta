"use client";

import { Component, type ReactNode } from "react";

import styles from "@/styles/intranet-error.module.css";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Algo ha fallado en esta sección</p>
          <p className={styles.errorMessage}>{this.state.message}</p>
          <button
            type="button"
            className={styles.reloadBtn}
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatElapsed, useTimer } from "@/lib/timerContext";
import { subscribeToProjects, type Project } from "@/lib/projects";
import styles from "@/styles/intranet-stop-modal.module.css";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function StopModal() {
  const { activeTimer, elapsed, pendingStop, confirmStop, cancelStop } = useTimer();

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load projects
  useEffect(() => {
    const unsub = subscribeToProjects(setProjects);
    return unsub;
  }, []);

  // When modal opens, pre-select if timer already had a project
  useEffect(() => {
    if (!pendingStop || !activeTimer) return;
    setNotes("");
    setSearch("");
    if (activeTimer.projectId) {
      const found = projects.find((p) => p.id === activeTimer.projectId) ?? null;
      setSelectedProject(found);
    } else {
      setSelectedProject(null);
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [pendingStop]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.trim();
    const list = projects.filter((p) => p.status === "activo" || p.status === "pausado");
    if (!q) return list.slice(0, 8);
    const nq = normalize(q);
    return list
      .filter((p) => normalize(p.name).includes(nq) || normalize(p.clientName ?? "").includes(nq))
      .slice(0, 8);
  }, [projects, search]);

  if (!pendingStop || !activeTimer) return null;

  async function handleSave() {
    if (!selectedProject) return;
    setSaving(true);
    await confirmStop(notes, selectedProject.id, selectedProject.name);
    setNotes("");
    setSearch("");
    setSelectedProject(null);
    setSaving(false);
  }

  async function handleDiscard() {
    // Stop timer without saving any entry
    await confirmStop("__discard__", "__discard__", "__discard__");
    setNotes("");
    setSearch("");
    setSelectedProject(null);
  }

  return (
    <div className={styles.backdrop} onClick={cancelStop}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Sesión finalizada</p>
            <p className={styles.elapsed}>{formatElapsed(elapsed)}</p>
          </div>
        </div>

        {/* Project selector */}
        <div className={styles.section}>
          <label className={styles.label}>
            Proyecto *
          </label>

          {selectedProject ? (
            <div className={styles.selectedProject}>
              <div className={styles.selectedProjectInfo}>
                <span className={styles.selectedProjectName}>{selectedProject.name}</span>
                {selectedProject.clientName && (
                  <span className={styles.selectedProjectClient}>{selectedProject.clientName}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setSelectedProject(null); setSearch(""); setTimeout(() => searchRef.current?.focus(), 60); }}
                className={styles.btnChange}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className={styles.projectPicker}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar proyecto…"
                className={styles.searchInput}
                autoComplete="off"
              />
              {filtered.length > 0 && (
                <div className={styles.projectList}>
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={styles.projectRow}
                      onClick={() => setSelectedProject(p)}
                    >
                      <div className={styles.projectRowInfo}>
                        <span className={styles.projectRowName}>{p.name}</span>
                        {p.clientName && (
                          <span className={styles.projectRowClient}>{p.clientName}</span>
                        )}
                      </div>
                      <span className={styles.projectRowStatus} data-status={p.status} />
                    </button>
                  ))}
                </div>
              )}
              {filtered.length === 0 && search && (
                <p className={styles.noResults}>Sin resultados</p>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className={styles.section}>
          <label htmlFor="stopNotes" className={styles.label}>
            ¿En qué trabajaste? <span style={{ opacity: 0.45 }}>(opcional)</span>
          </label>
          <textarea
            id="stopNotes"
            className={styles.textarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Maquetación header, fix bug login, reunión cliente…"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && selectedProject) void handleSave();
            }}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => void handleDiscard()}
            className={styles.btnDiscard}
            disabled={saving}
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className={styles.btnSave}
            disabled={saving || !selectedProject}
          >
            {saving ? "Guardando…" : "Guardar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { TimeHeatmap } from "@/components/TimeHeatmap";
import { subscribeToProjects, type Project } from "@/lib/projects";
import { subscribeToAllTimeEntries, type TimeEntry } from "@/lib/timeEntries";
import { formatDuration, formatElapsed, useTimer } from "@/lib/timerContext";
import styles from "@/styles/intranet-dashboard.module.css";

const DAY_MS = 86400000;

type WeatherState = {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  city: string | null;
};

const weatherLabels = new Map<number, string>([
  [0, "Cielo despejado"], [1, "Mayormente despejado"], [2, "Intervalos nubosos"],
  [3, "Cubierto"], [45, "Niebla"], [48, "Niebla con escarcha"],
  [51, "Llovizna ligera"], [53, "Llovizna moderada"], [55, "Llovizna intensa"],
  [61, "Lluvia ligera"], [63, "Lluvia moderada"], [65, "Lluvia intensa"],
  [80, "Chubascos"], [95, "Tormenta"],
]);

function timeFmt(ts: { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function dayKey(d: Date) { return d.toISOString().slice(0, 10); }

export function IntranetDashboard() {
  const { activeTimer, elapsed, stop } = useTimer();
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [weatherStatus, setWeatherStatus] = useState("Buscando tu ubicacion…");
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const unsubP = subscribeToProjects(setProjects);
    const unsubT = subscribeToAllTimeEntries(setEntries, 365);
    return () => { unsubP(); unsubT(); };
  }, []);

  // Weather
  const weatherDescription = useMemo(() => {
    if (!weather) return weatherStatus;
    const label = weatherLabels.get(weather.weatherCode) ?? "Tiempo variable";
    const cityLabel = weather.city ? ` en ${weather.city}` : "";
    return `${label}${cityLabel}. ${Math.round(weather.temperature)}° y viento de ${Math.round(weather.windSpeed)} km/h.`;
  }, [weather, weatherStatus]);

  useEffect(() => {
    let cancelled = false;
    async function loadWeather(lat: number, lon: number) {
      const res = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}`);
      if (!res.ok) throw new Error("failed");
      const d = await res.json() as { temperature?: number; windSpeed?: number; weatherCode?: number; city?: string };
      if (cancelled) return;
      if (typeof d?.temperature !== "number") { setWeatherStatus("No se pudo obtener el tiempo."); return; }
      setWeather({ temperature: d.temperature, windSpeed: d.windSpeed ?? 0, weatherCode: d.weatherCode ?? 0, city: d.city ?? null });
    }
    if (!("geolocation" in navigator)) { setWeatherStatus("Geolocalización no disponible."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { void loadWeather(coords.latitude, coords.longitude).catch(() => { if (!cancelled) setWeatherStatus("Error al consultar el tiempo."); }); },
      () => { if (!cancelled) setWeatherStatus("Activa la ubicación para ver el tiempo local."); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
    return () => { cancelled = true; };
  }, []);

  // Stats
  const activeProjects = useMemo(() => projects.filter((p) => p.status === "activo").length, [projects]);

  const weekSec = useMemo(() => {
    const cutoff = Date.now() - 7 * DAY_MS;
    return entries.filter((e) => e.startedAt.seconds * 1000 >= cutoff).reduce((a, e) => a + e.durationSeconds, 0);
  }, [entries]);

  const todaySec = useMemo(() => {
    const key = dayKey(new Date());
    return entries.filter((e) => dayKey(new Date(e.startedAt.seconds * 1000)) === key).reduce((a, e) => a + e.durationSeconds, 0);
  }, [entries]);

  const recentEntries = useMemo(() => entries.slice(0, 6), [entries]);

  const modules = [
    { href: "/intranet/clientes", label: "Directorio", title: "Clientes", description: "Fichas de clientes, contactos y proyectos asociados." },
    { href: "/intranet/proyectos", label: "Trabajo activo", title: "Proyectos", description: "Documentación técnica, endpoints API, tareas y tiempo." },
    { href: "/intranet/tiempo", label: "Registro", title: "Tiempo", description: "Historial de sesiones por proyecto. Exporta a CSV." },
    { href: "/intranet/links", label: "Accesos rápidos", title: "Links", description: "Herramientas externas, dashboards y recursos." },
    { href: "/intranet/buscar", label: "Búsqueda", title: "Buscar", description: "Busca en proyectos, clientes y tareas al instante." },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Dashboard</p>
        <h1>Roqueta</h1>
      </div>

      {/* Stats + Weather */}
      <section className={styles.hero}>
        <article className={styles.heroCard}>
          <p className={styles.label}>Resumen</p>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{activeProjects}</span>
              <span className={styles.statLabel}>proyectos activos</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{weekSec > 0 ? formatDuration(weekSec) : "—"}</span>
              <span className={styles.statLabel}>esta semana</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{todaySec > 0 ? formatDuration(todaySec) : "—"}</span>
              <span className={styles.statLabel}>hoy</span>
            </div>
          </div>

          {/* Active timer */}
          {activeTimer && (
            <div className={styles.timerBanner}>
              <span className={styles.timerDot} />
              <div className={styles.timerBannerInfo}>
                <span className={styles.timerBannerLabel}>En curso</span>
                <span className={styles.timerBannerProject}>{activeTimer.projectName}</span>
              </div>
              <span className={styles.timerBannerElapsed}>{formatElapsed(elapsed)}</span>
              <button type="button" onClick={() => stop()} className={styles.timerBannerStop}>
                Stop
              </button>
            </div>
          )}

          {/* Recent sessions */}
          {recentEntries.length > 0 && (
            <div className={styles.recentBlock}>
              <p className={styles.recentTitle}>Últimas sesiones</p>
              {recentEntries.map((e) => (
                <div key={e.id} className={styles.recentRow}>
                  <span className={styles.recentProject}>{e.projectName}</span>
                  {e.notes && <span className={styles.recentNotes}>{e.notes}</span>}
                  <span className={styles.recentTime}>{timeFmt(e.startedAt)}</span>
                  <span className={styles.recentDuration}>{formatDuration(e.durationSeconds)}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={styles.weatherCard}>
          <p className={styles.label}>Tiempo en tu ubicación</p>
          <h3>{weather ? `${Math.round(weather.temperature)}°C` : "—"}</h3>
          <p>{weatherDescription}</p>
          <span className={styles.weatherNote}>Open-Meteo · tu ubicación actual</span>
        </article>
      </section>

      {/* Activity heatmap */}
      <section className={styles.heatmapSection}>
        <p className={styles.heatmapTitle}>Actividad · último año</p>
        <TimeHeatmap entries={entries} />
      </section>

      {/* Module grid */}
      <section className={styles.grid}>
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className={styles.card}>
            <span>{mod.label}</span>
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

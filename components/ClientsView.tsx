"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import {
  createClient,
  deleteClient,
  type Client,
  type ClientInput,
  subscribeToClients,
  updateClient,
} from "@/lib/clients";
import styles from "@/styles/intranet-clients.module.css";

const emptyForm: ClientInput = {
  name: "",
  sector: "",
  contact: "",
  email: "",
  phone: "",
  notes: "",
};

export function ClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToClients((data) => {
      setClients(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [drawerOpen]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(client: Client, e: React.MouseEvent) {
    e.preventDefault();
    setEditing(client);
    setForm({
      name: client.name,
      sector: client.sector,
      contact: client.contact,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateClient(editing.id, form);
      } else {
        await createClient(form);
      }
      closeDrawer();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    await deleteClient(id);
    setConfirmDelete(null);
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Directorio</p>
          <h1 className={styles.title}>Clientes</h1>
        </div>
        <button type="button" onClick={openNew} className={styles.btnNew}>
          <Plus width={14} height={14} strokeWidth={2} />
          Nuevo cliente
        </button>
      </div>

      {loading && (
        <p className={styles.empty}>Cargando clientes…</p>
      )}

      {!loading && clients.length === 0 && (
        <p className={styles.empty}>
          Aún no hay clientes. Añade el primero con el botón de arriba.
        </p>
      )}

      {!loading && clients.length > 0 && (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <span>Cliente</span>
            <span>Sector</span>
            <span>Contacto</span>
            <span>Email</span>
            <span />
          </div>
          {clients.map((client) => (
            <div key={client.id} className={styles.row}>
              <Link href={`/intranet/clientes/${client.id}`} className={styles.rowName}>
                {client.name}
              </Link>
              <span className={styles.rowMeta}>{client.sector || "—"}</span>
              <span className={styles.rowMeta}>{client.contact || "—"}</span>
              <span className={styles.rowMeta}>{client.email || "—"}</span>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  onClick={(e) => openEdit(client, e)}
                  className={styles.btnAction}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(client.id)}
                  className={`${styles.btnAction} ${confirmDelete === client.id ? styles.btnDanger : ""}`}
                  onBlur={() => setConfirmDelete(null)}
                >
                  {confirmDelete === client.id ? "¿Seguro?" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-label={editing ? "Editar cliente" : "Nuevo cliente"}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLabel}>
            {editing ? "Editar cliente" : "Nuevo cliente"}
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            className={styles.drawerClose}
            aria-label="Cerrar"
          >
            <X width={16} height={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Nombre *</label>
            <input
              ref={nameRef}
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleField}
              className={styles.input}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="sector" className={styles.label}>Sector</label>
            <input
              id="sector"
              name="sector"
              type="text"
              value={form.sector}
              onChange={handleField}
              className={styles.input}
              autoComplete="off"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="contact" className={styles.label}>Persona de contacto</label>
              <input
                id="contact"
                name="contact"
                type="text"
                value={form.contact}
                onChange={handleField}
                className={styles.input}
                autoComplete="off"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>Teléfono</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleField}
                className={styles.input}
                autoComplete="off"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleField}
              className={styles.input}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="notes" className={styles.label}>Notas internas</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleField}
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={closeDrawer}
              className={styles.btnCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className={styles.btnSave}
            >
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </aside>
    </main>
  );
}

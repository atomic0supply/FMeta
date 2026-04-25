"use client";

import { useEffect, useState } from "react";

import {
  setUserActive,
  subscribeToAllUsers,
  updateUserRole,
  type UserProfile,
} from "@/lib/adminUsers";
import type { UserRole } from "@/lib/users";
import styles from "@/styles/intranet-team.module.css";

function initials(profile: UserProfile): string {
  const name = profile.displayName ?? profile.email ?? "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserManagementView() {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsub = subscribeToAllUsers(setUsers);
    return unsub;
  }, []);

  async function handleRoleChange(uid: string, role: UserRole) {
    await updateUserRole(uid, role);
  }

  async function handleToggleActive(uid: string, current: boolean) {
    await setUserActive(uid, !current);
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Administración</p>
          <h1 className={styles.title}>Equipo</h1>
        </div>
      </div>

      {users.length === 0 && (
        <p className={styles.empty}>No hay usuarios registrados.</p>
      )}

      {users.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Usuario</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Rol</th>
                <th className={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className={`${styles.tr} ${!u.active ? styles.trInactive : ""}`}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <span className={styles.avatar}>{initials(u)}</span>
                      <span className={styles.userName}>
                        {u.displayName ?? u.email ?? u.uid}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.email}>{u.email}</span>
                  </td>
                  <td className={styles.td}>
                    <select
                      className={styles.roleSelect}
                      value={u.role}
                      onChange={(e) => void handleRoleChange(u.uid, e.target.value as UserRole)}
                    >
                      <option value="admin">Admin</option>
                      <option value="team">Team</option>
                    </select>
                  </td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${u.active ? styles.toggleActive : styles.toggleInactive}`}
                      onClick={() => void handleToggleActive(u.uid, u.active)}
                    >
                      {u.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

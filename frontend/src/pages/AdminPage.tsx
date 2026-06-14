import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import type { Role, User } from "../lib/types";

interface Stats {
  users: number;
  students: number;
  teachers: number;
  books: number;
  quizzes: number;
  attempts: number;
}

export function AdminPage() {
  const { t } = useI18n();
  const { user: current } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const load = () => {
    api<{ stats: Stats }>("/admin/stats").then((d) => setStats(d.stats));
    api<{ users: User[] }>("/admin/users").then((d) => setUsers(d.users));
  };

  useEffect(load, []);

  const changeRole = async (id: number, role: Role) => {
    await api(`/admin/users/${id}`, { method: "PATCH", body: { role } });
    load();
  };

  const removeUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await api(`/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="page">
      <h1>{t("adminPanel")}</h1>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.users}</span>
            <span className="stat-label">{t("users")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.students}</span>
            <span className="stat-label">{t("students")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.teachers}</span>
            <span className="stat-label">{t("teacher")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.books}</span>
            <span className="stat-label">{t("library")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.quizzes}</span>
            <span className="stat-label">{t("quizzes")}</span>
          </div>
          <div className="stat-card accent">
            <span className="stat-value">{stats.attempts}</span>
            <span className="stat-label">{t("quizzesTaken")}</span>
          </div>
        </div>
      )}

      <section className="panel">
        <h2>{t("manageUsers")}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("email")}</th>
                <th>{t("role")}</th>
                <th>{t("grade")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      disabled={u.id === current?.id}
                    >
                      <option value="student">{t("student")}</option>
                      <option value="teacher">{t("teacher")}</option>
                      <option value="admin">{t("admin")}</option>
                    </select>
                  </td>
                  <td>{u.grade ?? "-"}</td>
                  <td>
                    {u.id !== current?.id && (
                      <button
                        className="btn-ghost small danger"
                        onClick={() => removeUser(u.id)}
                      >
                        {t("delete")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { Chatbot } from "./Chatbot";

export function Layout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/library" className="brand">
          <span className="brand-mark">{"\u0627\u06cc"}</span>
          <span>
            <strong>{t("appName")}</strong>
          </span>
        </NavLink>

        <nav className="main-nav">
          <NavLink to="/library">{t("library")}</NavLink>
          {user?.role !== "parent" && (
            <NavLink to="/dashboard">{t("dashboard")}</NavLink>
          )}
          {(user?.role === "parent" || user?.role === "admin") && (
            <NavLink to="/parent">{t("parentPanel")}</NavLink>
          )}
          {(user?.role === "teacher" || user?.role === "admin") && (
            <NavLink to="/teacher">{t("teacherPanel")}</NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin">{t("adminPanel")}</NavLink>
          )}
        </nav>

        <div className="topbar-actions">
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            title="Toggle language"
          >
            {t("language")}
          </button>
          <NavLink to="/profile" className="user-chip">
            {user?.name}
            <span className={`role-badge role-${user?.role}`}>
              {user ? t(user.role) : ""}
            </span>
          </NavLink>
          <button className="btn-ghost" onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <Chatbot />
    </div>
  );
}

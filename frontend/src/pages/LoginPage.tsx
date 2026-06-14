import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { ApiError } from "../lib/api";

const demoAccounts = [
  { label: "Student", email: "student@ekitab.pk" },
  { label: "Teacher", email: "teacher@ekitab.pk" },
  { label: "Admin", email: "admin@ekitab.pk" },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@ekitab.pk");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/library" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/library");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <button
          className="lang-toggle on-hero"
          onClick={() => setLang(lang === "en" ? "ur" : "en")}
        >
          {t("language")}
        </button>
        <div className="brand-mark big">{"\u0627\u06cc"}</div>
        <h1>{t("appName")}</h1>
        <p>{t("tagline")}</p>
        <ul className="hero-points">
          <li>{lang === "ur" ? "\u062f\u0648 \u0632\u0628\u0627\u0646\u06cc \u0688\u062c\u06cc\u0679\u0644 \u06a9\u062a\u0627\u0628\u06cc\u06ba" : "Bilingual digital textbooks"}</li>
          <li>{lang === "ur" ? "\u0622\u0688\u06cc\u0648 \u0646\u0631\u06cc\u0634\u0646 \u0627\u0648\u0631 \u06a9\u0648\u0626\u0632" : "Audio narration & quizzes"}</li>
          <li>{lang === "ur" ? "\u067e\u06cc\u0634 \u0631\u0641\u062a \u06a9\u06cc \u0646\u06af\u0631\u0627\u0646\u06cc" : "Progress tracking & analytics"}</li>
        </ul>
      </div>

      <div className="auth-card">
        <h2>{t("login")}</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            {t("email")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            {t("password")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "..." : t("login")}
          </button>
        </form>

        <p className="auth-switch">
          {lang === "ur" ? "\u0627\u06a9\u0627\u0624\u0646\u0679 \u0646\u06c1\u06cc\u06ba\u061f " : "No account? "}
          <Link to="/register">{t("register")}</Link>
        </p>

        <div className="demo-box">
          <span className="demo-title">{t("demoAccounts")}</span>
          <div className="demo-buttons">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword("Password123");
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <code>Password123</code>
        </div>
      </div>
    </div>
  );
}

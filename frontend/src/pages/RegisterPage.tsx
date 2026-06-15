import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { ApiError } from "../lib/api";

export function RegisterPage() {
  const { user, register } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "parent">(
    "student",
  );
  const [grade, setGrade] = useState("5");
  const [childEmail, setChildEmail] = useState("");
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
      await register({
        name,
        email,
        password,
        role,
        grade: role === "student" ? Number(grade) : undefined,
        childEmail:
          role === "parent" && childEmail.trim() ? childEmail.trim() : undefined,
        preferredLanguage: lang,
      });
      navigate("/library");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
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
      </div>

      <div className="auth-card">
        <h2>{t("register")}</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            {t("name")}
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
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
              minLength={8}
              required
            />
          </label>
          <label>
            {t("role")}
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "student" | "teacher" | "parent")
              }
            >
              <option value="student">{t("student")}</option>
              <option value="teacher">{t("teacher")}</option>
              <option value="parent">{t("parent")}</option>
            </select>
          </label>
          {role === "student" && (
            <label>
              {t("grade")}
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          )}
          {role === "parent" && (
            <label>
              {t("childEmail")}
              <input
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder="student@ekitab.pk"
              />
              <span className="field-hint">{t("linkChildHint")}</span>
            </label>
          )}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "..." : t("register")}
          </button>
        </form>
        <p className="auth-switch">
          {lang === "ur" ? "\u067e\u06c1\u0644\u06d2 \u0633\u06d2 \u0627\u06a9\u0627\u0624\u0646\u0679\u061f " : "Already have an account? "}
          <Link to="/login">{t("login")}</Link>
        </p>
      </div>
    </div>
  );
}

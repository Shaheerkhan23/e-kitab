import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import type { Language } from "../lib/types";

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { t, setLang } = useI18n();
  const [name, setName] = useState(user?.name ?? "");
  const [grade, setGrade] = useState(user?.grade ? String(user.grade) : "");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(
    user?.preferredLanguage ?? "en",
  );
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      grade: user.role === "student" && grade ? Number(grade) : null,
      preferredLanguage,
    });
    setLang(preferredLanguage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page narrow">
      <h1>{t("profile")}</h1>
      <div className="panel">
        <div className="profile-head">
          <div className={`avatar role-${user.role}`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.email}</strong>
            <div>
              <span className={`role-badge role-${user.role}`}>
                {t(user.role)}
              </span>
            </div>
          </div>
        </div>

        {saved && <div className="alert-success">{t("save")} \u2713</div>}

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            {t("name")}
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {user.role === "student" && (
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
          <label>
            {t("language")}
            <select
              value={preferredLanguage}
              onChange={(e) =>
                setPreferredLanguage(e.target.value as Language)
              }
            >
              <option value="en">English</option>
              <option value="ur">{"\u0627\u0631\u062f\u0648"}</option>
            </select>
          </label>
          <button className="btn-primary" type="submit">
            {t("save")}
          </button>
        </form>
      </div>
    </div>
  );
}

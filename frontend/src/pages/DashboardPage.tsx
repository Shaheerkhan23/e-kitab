import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import type { StudentDashboard } from "../lib/types";

export function DashboardPage() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<StudentDashboard | null>(null);

  useEffect(() => {
    api<StudentDashboard>("/student/dashboard").then(setData);
  }, []);

  if (!data) return <div className="spinner" />;

  const { stats, progress, attempts, assignments } = data;

  return (
    <div className="page">
      <h1>{t("dashboard")}</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.booksStarted}</span>
          <span className="stat-label">{t("booksStarted")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.booksCompleted}</span>
          <span className="stat-label">{t("booksCompleted")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.quizzesTaken}</span>
          <span className="stat-label">{t("quizzesTaken")}</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-value">{stats.averageScore}%</span>
          <span className="stat-label">{t("averageScore")}</span>
        </div>
      </div>

      <div className="dash-columns">
        <section className="panel">
          <h2>{t("myProgress")}</h2>
          {progress.length === 0 ? (
            <p className="muted">{t("noData")}</p>
          ) : (
            <ul className="progress-list">
              {progress.map((p) => (
                <li key={p.bookId}>
                  <Link to={`/books/${p.bookId}/read`}>
                    <div className="progress-row-head">
                      <span>{lang === "ur" && p.titleUr ? p.titleUr : p.titleEn}</span>
                      <span>{p.percent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${p.percent}%`,
                          background: p.coverColor,
                        }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>{t("recentQuizzes")}</h2>
          {attempts.length === 0 ? (
            <p className="muted">{t("noData")}</p>
          ) : (
            <ul className="attempt-list">
              {attempts.map((a) => (
                <li key={a.id}>
                  <span>{a.quizTitleEn}</span>
                  <span
                    className={`pill ${a.score / a.total >= 0.6 ? "ok" : "no"}`}
                  >
                    {a.score}/{a.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>{t("assignments")}</h2>
        {assignments.length === 0 ? (
          <p className="muted">{t("noData")}</p>
        ) : (
          <ul className="assignment-list">
            {assignments.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>
                    {a.bookTitleEn ?? a.quizTitleEn ?? t("assignments")}
                  </strong>
                  {a.note && <p className="muted">{a.note}</p>}
                  <span className="muted small">
                    {t("teacher")}: {a.teacherName}
                    {a.dueDate ? ` \u00b7 ${t("dueDate")}: ${a.dueDate}` : ""}
                  </span>
                </div>
                {a.bookId && (
                  <Link className="btn-ghost small" to={`/books/${a.bookId}/read`}>
                    {t("read")}
                  </Link>
                )}
                {a.quizId && (
                  <Link
                    className="btn-ghost small"
                    to={`/quizzes/${a.quizId}`}
                  >
                    {t("takeQuiz")}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import type { ChildSummary, StudentDetail } from "../lib/types";

export function ParentPage() {
  const { t } = useI18n();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);

  useEffect(() => {
    api<{ children: ChildSummary[] }>("/parent/children").then((d) =>
      setChildren(d.children),
    );
  }, []);

  const openChild = (id: number) => {
    setSelected(id);
    setDetail(null);
    api<StudentDetail>(`/parent/children/${id}`).then(setDetail);
  };

  return (
    <div className="page">
      <h1>{t("parentPanel")}</h1>

      {children.length === 0 ? (
        <p className="muted">{t("noChildren")}</p>
      ) : (
        <div className="child-grid">
          {children.map((c) => (
            <div key={c.id} className="child-card">
              <div className="child-head">
                <strong>{c.name}</strong>
                <span className="muted small">
                  {t("grade")} {c.grade ?? "-"}
                </span>
              </div>
              <div className="child-stats">
                <div>
                  <span className="stat-value">{c.avgProgress}%</span>
                  <span className="stat-label">{t("progress")}</span>
                </div>
                <div>
                  <span className="stat-value">{c.quizzesTaken}</span>
                  <span className="stat-label">{t("quizzesTaken")}</span>
                </div>
                <div>
                  <span
                    className={`stat-value ${c.avgScore >= 60 ? "good" : "bad"}`}
                  >
                    {c.avgScore}%
                  </span>
                  <span className="stat-label">{t("averageScore")}</span>
                </div>
              </div>
              <button
                className="btn-ghost small"
                onClick={() => openChild(c.id)}
              >
                {t("viewDetails")}
              </button>
            </div>
          ))}
        </div>
      )}

      {selected !== null && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {!detail ? (
              <div className="spinner" />
            ) : (
              <>
                <div className="modal-head">
                  <h2>{detail.student.name}</h2>
                  <button
                    className="btn-ghost small"
                    onClick={() => setSelected(null)}
                  >
                    {t("close")}
                  </button>
                </div>

                <h3>{t("myProgress")}</h3>
                {detail.progress.length === 0 ? (
                  <p className="muted">{t("noData")}</p>
                ) : (
                  <ul className="progress-list">
                    {detail.progress.map((p, i) => (
                      <li key={i}>
                        <div className="progress-row-head">
                          <span>{p.titleEn}</span>
                          <span>{p.percent}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${p.percent}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <h3>{t("recentQuizzes")}</h3>
                {detail.attempts.length === 0 ? (
                  <p className="muted">{t("noData")}</p>
                ) : (
                  <ul className="attempt-list">
                    {detail.attempts.map((a, i) => (
                      <li key={i}>
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

                <h3>{t("assignments")}</h3>
                {!detail.assignments || detail.assignments.length === 0 ? (
                  <p className="muted">{t("noData")}</p>
                ) : (
                  <ul className="assignment-list">
                    {detail.assignments.map((a) => (
                      <li key={a.id}>
                        <div>
                          <strong>
                            {a.bookTitleEn ?? a.quizTitleEn ?? t("assignments")}
                          </strong>
                          {a.note && <p className="muted small">{a.note}</p>}
                          <span className="muted small">
                            {t("teacher")}: {a.teacherName}
                            {a.dueDate ? ` \u00b7 ${t("dueDate")}: ${a.dueDate}` : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

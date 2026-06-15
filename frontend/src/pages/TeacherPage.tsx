import { useEffect, useState } from "react";
import { api, apiUpload } from "../lib/api";
import { useI18n } from "../i18n";
import type {
  Book,
  QuizListItem,
  StudentDetail,
  StudentSummary,
  TeacherAssignment,
} from "../lib/types";

interface Overview {
  students: number;
  books: number;
  quizzes: number;
  attempts: number;
}

export function TeacherPage() {
  const { t } = useI18n();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);

  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [note, setNote] = useState("");
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const [boards, setBoards] = useState<string[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const load = () => {
    api<{ stats: Overview }>("/teacher/overview").then((d) =>
      setOverview(d.stats),
    );
    api<{ students: StudentSummary[] }>("/teacher/students").then((d) =>
      setStudents(d.students),
    );
    api<{ assignments: TeacherAssignment[] }>("/teacher/assignments").then((d) =>
      setAssignments(d.assignments),
    );
    api<{ books: Book[] }>("/books").then((d) => setBooks(d.books));
    api<{ quizzes: QuizListItem[] }>("/teacher/quizzes").then((d) =>
      setQuizzes(d.quizzes),
    );
    api<{ boards: string[] }>("/books/filters").then((d) =>
      setBoards(d.boards),
    );
  };

  useEffect(load, []);

  const openStudent = (id: number) => {
    setDetailOpen(true);
    setDetail(null);
    api<StudentDetail>(`/teacher/students/${id}`).then(setDetail);
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/teacher/assignments", {
        method: "POST",
        body: {
          studentId: Number(studentId),
          bookId: bookId ? Number(bookId) : undefined,
          quizId: quizId ? Number(quizId) : undefined,
          note,
          dueDate: dueDate || undefined,
        },
      });
      setNote("");
      setDueDate("");
      setBookId("");
      setQuizId("");
      load();
    } catch {
      setError("Attach a book or a quiz and pick a student");
    }
  };

  const removeAssignment = async (id: number) => {
    await api(`/teacher/assignments/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>{t("teacherPanel")}</h1>
        <button className="btn-primary" onClick={() => setCatalogOpen(true)}>
          {`+ ${t("addToCatalog")}`}
        </button>
      </div>

      {overview && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{overview.students}</span>
            <span className="stat-label">{t("students")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{overview.books}</span>
            <span className="stat-label">{t("library")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{overview.quizzes}</span>
            <span className="stat-label">{t("quizzes")}</span>
          </div>
          <div className="stat-card accent">
            <span className="stat-value">{overview.attempts}</span>
            <span className="stat-label">{t("quizzesTaken")}</span>
          </div>
        </div>
      )}

      <section className="panel">
        <h2>{t("students")}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("grade")}</th>
                <th>{t("progress")}</th>
                <th>{t("quizzesTaken")}</th>
                <th>{t("averageScore")}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="clickable-row"
                  onClick={() => openStudent(s.id)}
                >
                  <td>
                    <strong>{s.name}</strong>
                    <div className="muted small">{s.email}</div>
                  </td>
                  <td>{s.grade ?? "-"}</td>
                  <td>
                    <div className="mini-bar">
                      <div
                        className="mini-fill"
                        style={{ width: `${s.avgProgress}%` }}
                      />
                    </div>
                    {s.avgProgress}%
                  </td>
                  <td>{s.quizzesTaken}</td>
                  <td>
                    <span
                      className={`pill ${s.avgScore >= 60 ? "ok" : "no"}`}
                    >
                      {s.avgScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="dash-columns">
        <section className="panel">
          <h2>{t("createAssignment")}</h2>
          {error && <div className="alert-error">{error}</div>}
          <form className="stacked-form" onSubmit={createAssignment}>
            <label>
              {t("students")}
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">--</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("library")}
              <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
                <option value="">--</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.titleEn}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("quiz")}
              <select value={quizId} onChange={(e) => setQuizId(e.target.value)}>
                <option value="">--</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.titleEn} ({q.bookTitleEn})
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("note")}
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <label>
              {t("dueDate")}
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <button className="btn-primary" type="submit">
              {t("create")}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>{t("assignments")}</h2>
          {assignments.length === 0 ? (
            <p className="muted">{t("noData")}</p>
          ) : (
            <ul className="assignment-list">
              {assignments.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.studentName}</strong>
                    <p className="muted small">
                      {a.bookTitleEn ?? a.quizTitleEn}
                      {a.note ? ` \u00b7 ${a.note}` : ""}
                    </p>
                  </div>
                  <button
                    className="btn-ghost small"
                    onClick={() => removeAssignment(a.id)}
                  >
                    {t("delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {catalogOpen && (
        <CatalogModal
          boards={boards}
          onClose={() => setCatalogOpen(false)}
          onSaved={() => {
            setCatalogOpen(false);
            load();
          }}
        />
      )}

      {detailOpen && (
        <div className="modal-backdrop" onClick={() => setDetailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {!detail ? (
              <div className="spinner" />
            ) : (
              <>
                <div className="modal-head">
                  <h2>{detail.student.name}</h2>
                  <button
                    className="btn-ghost small"
                    onClick={() => setDetailOpen(false)}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CatalogModalProps {
  boards: string[];
  onClose: () => void;
  onSaved: () => void;
}

const BOARD_OPTIONS = ["PTB", "FBISE", "BISEP"];

function CatalogModal({ boards, onClose, onSaved }: CatalogModalProps) {
  const { t } = useI18n();
  const boardChoices = Array.from(new Set([...BOARD_OPTIONS, ...boards]));

  const [titleEn, setTitleEn] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [subjectEn, setSubjectEn] = useState("");
  const [grade, setGrade] = useState("10");
  const [board, setBoard] = useState(boardChoices[0] ?? "FBISE");
  const [author, setAuthor] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [coverColor, setCoverColor] = useState("#2563eb");
  const [contentEn, setContentEn] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const form = new FormData();
      form.append("titleEn", titleEn);
      form.append("titleUr", titleUr);
      form.append("subjectEn", subjectEn);
      form.append("grade", grade);
      form.append("board", board);
      form.append("author", author);
      form.append("descriptionEn", descriptionEn);
      form.append("coverColor", coverColor);
      form.append("contentEn", contentEn);
      if (pdf) form.append("pdf", pdf);
      await apiUpload("/books/upload", form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t("newBookOrNote")}</h2>
          <button className="btn-ghost small" onClick={onClose}>
            {t("close")}
          </button>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <form className="stacked-form" onSubmit={submit}>
          <label>
            {t("titleEnLabel")}
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </label>
          <label>
            {t("titleUrLabel")}
            <input value={titleUr} onChange={(e) => setTitleUr(e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              {t("subject")}
              <input
                value={subjectEn}
                onChange={(e) => setSubjectEn(e.target.value)}
                required
              />
            </label>
            <label>
              {t("grade")}
              <input
                type="number"
                min={1}
                max={12}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              {t("board")}
              <select value={board} onChange={(e) => setBoard(e.target.value)}>
                {boardChoices.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("coverColor")}
              <input
                type="color"
                value={coverColor}
                onChange={(e) => setCoverColor(e.target.value)}
              />
            </label>
          </div>
          <label>
            {t("author")} <span className="muted small">({t("optional")})</span>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
          <label>
            {t("description")}{" "}
            <span className="muted small">({t("optional")})</span>
            <input
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
            />
          </label>
          <label>
            {t("pdfFile")} <span className="muted small">({t("optional")})</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
            />
          </label>
          <label>
            {t("noteContent")}{" "}
            <span className="muted small">({t("optional")})</span>
            <textarea
              rows={4}
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
            />
          </label>
          <p className="muted small">{t("noteContentHint")}</p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              {t("cancel")}
            </button>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? t("saving") : t("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

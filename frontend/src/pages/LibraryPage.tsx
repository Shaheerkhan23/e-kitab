import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { pick, useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import type { Book } from "../lib/types";

interface Filters {
  grades: number[];
  boards: string[];
  subjects: string[];
}

export function LibraryPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState<Filters>({
    grades: [],
    boards: [],
    subjects: [],
  });
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Filters>("/books/filters").then(setFilters).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (grade) params.set("grade", grade);
    if (subject) params.set("subject", subject);
    if (board) params.set("board", board);
    if (q) params.set("q", q);
    const query = params.toString();
    api<{ books: Book[] }>(`/books${query ? `?${query}` : ""}`)
      .then((data) => setBooks(data.books))
      .finally(() => setLoading(false));
  }, [grade, subject, board, q]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t("library")}</h1>
          <p className="muted">
            {t("welcome")}, {user?.name}
          </p>
        </div>
      </div>

      <div className="filters">
        <input
          className="search"
          placeholder={t("search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">{t("allGrades")}</option>
          {filters.grades.map((g) => (
            <option key={g} value={g}>
              {t("grade")} {g}
            </option>
          ))}
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">{t("allSubjects")}</option>
          {filters.subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={board} onChange={(e) => setBoard(e.target.value)}>
          <option value="">{t("allBoards")}</option>
          {filters.boards.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : books.length === 0 ? (
        <p className="muted">{t("noBooks")}</p>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="book-card">
              <div
                className="book-cover"
                style={{ background: book.coverColor }}
              >
                <span className="book-spine" />
                <span className="cover-subject">
                  {pick(book, "subject", lang)}
                </span>
                <span className="cover-title">{pick(book, "title", lang)}</span>
                <span className="cover-grade">
                  {t("grade")} {book.grade}
                </span>
              </div>
              <div className="book-meta">
                <strong>{pick(book, "title", lang)}</strong>
                <span className="badge">{book.board}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

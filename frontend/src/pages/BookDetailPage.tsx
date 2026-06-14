import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { pick, useI18n } from "../i18n";
import type { Book, Chapter, QuizSummary } from "../lib/types";

interface BookResponse {
  book: Book;
  chapters: Chapter[];
  quizzes: QuizSummary[];
}

export function BookDetailPage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [data, setData] = useState<BookResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<BookResponse>(`/books/${id}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!data) return <p className="muted">{t("noBooks")}</p>;

  const { book, chapters, quizzes } = data;

  return (
    <div className="page">
      <Link to="/library" className="back-link">
        {lang === "ur" ? "\u2192 " : "\u2190 "}
        {t("library")}
      </Link>

      <div className="book-detail-head">
        <div
          className="book-cover large"
          style={{ background: book.coverColor }}
        >
          <span className="cover-subject">{pick(book, "subject", lang)}</span>
          <span className="cover-title">{pick(book, "title", lang)}</span>
          <span className="cover-grade">
            {t("grade")} {book.grade}
          </span>
        </div>
        <div className="book-detail-info">
          <h1>{pick(book, "title", lang)}</h1>
          <div className="chips">
            <span className="badge">{book.board}</span>
            <span className="badge light">{pick(book, "subject", lang)}</span>
            <span className="badge light">
              {t("grade")} {book.grade}
            </span>
          </div>
          <p>{pick(book, "description", lang)}</p>
          {book.author && <p className="muted">{book.author}</p>}
          <Link className="btn-primary" to={`/books/${book.id}/read`}>
            {t("startReading")}
          </Link>
        </div>
      </div>

      <section>
        <h2>{t("chapters")}</h2>
        <ol className="chapter-list">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link to={`/books/${book.id}/read?chapter=${chapter.id}`}>
                {pick(chapter, "title", lang)}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {quizzes.length > 0 && (
        <section>
          <h2>{t("quizzes")}</h2>
          <div className="quiz-list">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} to={`/quizzes/${quiz.id}`} className="quiz-row">
                <span>{pick(quiz, "title", lang)}</span>
                <span className="btn-ghost small">{t("takeQuiz")}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

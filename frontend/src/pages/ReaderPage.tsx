import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { pick, useI18n } from "../i18n";
import { summarize } from "../lib/summarize";
import type { Book, Chapter, Highlight, QuizSummary } from "../lib/types";

interface BookResponse {
  book: Book;
  chapters: Chapter[];
  quizzes: QuizSummary[];
}

// Give every book its own reader look by rotating through a set of themes.
const READER_THEMES = [
  "reader-theme-serif",
  "reader-theme-modern",
  "reader-theme-warm",
  "reader-theme-mono",
];

function readerThemeClass(bookId: number): string {
  return READER_THEMES[bookId % READER_THEMES.length];
}

export function ReaderPage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<BookResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [speaking, setSpeaking] = useState(false);
  const [summary, setSummary] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const chapters = data?.chapters ?? [];
  const chapter = chapters[index];

  useEffect(() => {
    api<BookResponse>(`/books/${id}`).then((res) => {
      setData(res);
      const chapterParam = searchParams.get("chapter");
      if (chapterParam) {
        const found = res.chapters.findIndex(
          (c) => c.id === Number(chapterParam),
        );
        if (found >= 0) setIndex(found);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadChapterState = useCallback(
    (chapterId: number, total: number, position: number) => {
      setSummary("");
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      api<{ highlights: Highlight[] }>(
        `/reader/highlights?chapterId=${chapterId}`,
      )
        .then((res) => setHighlights(res.highlights))
        .catch(() => setHighlights([]));
      api<{ bookmarks: { chapterId: number }[] }>("/reader/bookmarks")
        .then((res) =>
          setBookmarked(res.bookmarks.some((b) => b.chapterId === chapterId)),
        )
        .catch(() => undefined);
      const percent = Math.round(((position + 1) / total) * 100);
      api(`/reader/progress`, {
        method: "PUT",
        body: { bookId: Number(id), lastChapterId: chapterId, percent },
      }).catch(() => undefined);
    },
    [id],
  );

  useEffect(() => {
    if (chapter) {
      setSearchParams({ chapter: String(chapter.id) }, { replace: true });
      loadChapterState(chapter.id, chapters.length, index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, chapters.length]);

  const content = useMemo(
    () => (chapter ? pick(chapter, "content", lang) : ""),
    [chapter, lang],
  );

  const handleListen = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = lang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleSummarize = () => {
    setSummary(summarize(content, 2));
  };

  const toggleBookmark = async () => {
    if (!chapter) return;
    if (bookmarked) {
      await api(`/reader/bookmarks/${chapter.id}`, { method: "DELETE" });
      setBookmarked(false);
    } else {
      await api("/reader/bookmarks", {
        method: "POST",
        body: { chapterId: chapter.id },
      });
      setBookmarked(true);
    }
  };

  const handleHighlight = async () => {
    if (!chapter) return;
    const selection = window.getSelection()?.toString().trim();
    if (!selection) {
      alert(
        lang === "ur"
          ? "\u067e\u06c1\u0644\u06d2 \u0645\u062a\u0646 \u0645\u0646\u062a\u062e\u0628 \u06a9\u0631\u06cc\u06ba"
          : "Select some text first.",
      );
      return;
    }
    const res = await api<{ id: number }>("/reader/highlights", {
      method: "POST",
      body: { chapterId: chapter.id, text: selection },
    });
    setHighlights((prev) => [
      { id: res.id, chapterId: chapter.id, text: selection, createdAt: "" },
      ...prev,
    ]);
  };

  const removeHighlight = async (highlightId: number) => {
    await api(`/reader/highlights/${highlightId}`, { method: "DELETE" });
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
  };

  if (!data) return <div className="spinner" />;

  const book = data.book;
  const themeClass = readerThemeClass(book.id);
  const accentStyle = {
    "--book-accent": book.coverColor,
  } as CSSProperties;

  if (book.pdfUrl) {
    return (
      <div className={`reader reader-pdf ${themeClass}`} style={accentStyle}>
        <div className="reader-toolbar">
          <Link to={`/books/${id}`} className="back-link">
            {lang === "ur" ? "\u2192 " : "\u2190 "}
            {pick(book, "title", lang)}
          </Link>
          <a
            className="btn-ghost small"
            href={book.pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t("openPdf")}
          </a>
        </div>
        <iframe
          className="pdf-frame"
          title={pick(book, "title", lang)}
          src={book.pdfUrl}
        />
      </div>
    );
  }

  if (!chapter) return <div className="spinner" />;

  const quiz = data.quizzes[0];

  return (
    <div className={`reader ${themeClass}`} style={accentStyle}>
      <div className="reader-toolbar">
        <Link to={`/books/${id}`} className="back-link">
          {lang === "ur" ? "\u2192 " : "\u2190 "}
          {pick(data.book, "title", lang)}
        </Link>
        <div className="reader-tools">
          <button className="btn-ghost small" onClick={handleListen}>
            {speaking ? `\u23f9 ${t("stop")}` : `\u25b6 ${t("listen")}`}
          </button>
          <button className="btn-ghost small" onClick={handleSummarize}>
            {t("summarize")}
          </button>
          <button className="btn-ghost small" onClick={handleHighlight}>
            {t("highlight")}
          </button>
          <button
            className={`btn-ghost small ${bookmarked ? "active" : ""}`}
            onClick={toggleBookmark}
          >
            {bookmarked ? `\u2605 ${t("bookmarked")}` : `\u2606 ${t("bookmark")}`}
          </button>
          <span className="font-control">
            {t("fontSize")}
            <button onClick={() => setFontSize((s) => Math.max(14, s - 2))}>
              A-
            </button>
            <button onClick={() => setFontSize((s) => Math.min(30, s + 2))}>
              A+
            </button>
          </span>
        </div>
      </div>

      <div className="reader-body">
        <article className="reader-page" style={{ fontSize }}>
          <h1>{pick(chapter, "title", lang)}</h1>
          {summary && (
            <div className="summary-box">
              <strong>{t("summary")}</strong>
              <p>{summary}</p>
            </div>
          )}
          {content.split(/\n+/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <aside className="reader-side">
          <h3>{t("chapters")}</h3>
          <ol className="reader-chapter-list">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  className={i === index ? "active" : ""}
                  onClick={() => setIndex(i)}
                >
                  {pick(c, "title", lang)}
                </button>
              </li>
            ))}
          </ol>

          {highlights.length > 0 && (
            <>
              <h3>{t("highlights")}</h3>
              <ul className="highlight-list">
                {highlights.map((h) => (
                  <li key={h.id}>
                    <span>{h.text}</span>
                    <button onClick={() => removeHighlight(h.id)}>
                      {"\u00d7"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {quiz && (
            <Link className="btn-primary block" to={`/quizzes/${quiz.id}`}>
              {t("takeQuiz")}
            </Link>
          )}
        </aside>
      </div>

      <div className="reader-nav">
        <button
          className="btn-ghost"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          {t("previous")}
        </button>
        <span>
          {index + 1} / {chapters.length}
        </span>
        <button
          className="btn-ghost"
          disabled={index === chapters.length - 1}
          onClick={() => setIndex((i) => Math.min(chapters.length - 1, i + 1))}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}

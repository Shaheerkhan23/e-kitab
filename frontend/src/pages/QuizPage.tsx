import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { pick, useI18n } from "../i18n";
import type { QuizDetail, QuizResult } from "../lib/types";

export function QuizPage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<QuizDetail>(`/quizzes/${id}`).then(setQuiz);
  }, [id]);

  if (!quiz) return <div className="spinner" />;

  const handleSubmit = async () => {
    setBusy(true);
    const ordered = quiz.questions.map((_q, i) => answers[i] ?? -1);
    try {
      const res = await api<QuizResult>(`/quizzes/${id}/submit`, {
        method: "POST",
        body: { answers: ordered },
      });
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  const percent = result
    ? Math.round((result.score / result.total) * 100)
    : 0;

  return (
    <div className="page narrow">
      <Link to={`/books/${quiz.quiz.bookId}`} className="back-link">
        {lang === "ur" ? "\u2192 " : "\u2190 "}
        {t("quizzes")}
      </Link>
      <h1>{pick(quiz.quiz, "title", lang)}</h1>

      {result && (
        <div className={`result-banner ${percent >= 60 ? "pass" : "fail"}`}>
          <div className="result-score">
            {result.score} / {result.total}
          </div>
          <div>
            <strong>{t("score")}</strong>
            <div>{percent}%</div>
          </div>
          <button className="btn-ghost" onClick={reset}>
            {t("tryAgain")}
          </button>
        </div>
      )}

      <div className="quiz-questions">
        {quiz.questions.map((question, qIndex) => {
          const options = lang === "ur" && question.optionsUr.length
            ? question.optionsUr
            : question.optionsEn;
          const resultForQ = result?.results[qIndex];
          return (
            <div key={question.id} className="quiz-question">
              <p className="q-prompt">
                <span className="q-number">{qIndex + 1}</span>
                {pick(question, "prompt", lang)}
              </p>
              <div className="q-options">
                {options.map((option, oIndex) => {
                  const selected = answers[qIndex] === oIndex;
                  let cls = "q-option";
                  if (result && resultForQ) {
                    if (oIndex === resultForQ.correctIndex) cls += " correct";
                    else if (selected && !resultForQ.correct) cls += " wrong";
                  } else if (selected) {
                    cls += " selected";
                  }
                  return (
                    <button
                      key={oIndex}
                      className={cls}
                      disabled={!!result}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {result && resultForQ && (
                <span
                  className={`q-verdict ${resultForQ.correct ? "ok" : "no"}`}
                >
                  {resultForQ.correct ? t("correct") : t("incorrect")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!result && (
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={busy || Object.keys(answers).length !== quiz.questions.length}
        >
          {t("submit")}
        </button>
      )}
    </div>
  );
}

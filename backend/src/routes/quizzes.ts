import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notFound } from "../lib/errors.js";
import {
  toPublicQuestion,
  type QuestionRow,
  type QuizRow,
} from "../types.js";

export const quizzesRouter = Router();

quizzesRouter.use(requireAuth);

const idParam = z.coerce.number().int().positive();

quizzesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(id) as
      | QuizRow
      | undefined;
    if (!quiz) {
      throw notFound("Quiz not found");
    }
    const questions = db
      .prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY position ASC")
      .all(id) as QuestionRow[];
    const includeAnswer =
      req.user!.role === "teacher" || req.user!.role === "admin";
    res.json({
      quiz: { id: quiz.id, titleEn: quiz.title_en, titleUr: quiz.title_ur, bookId: quiz.book_id },
      questions: questions.map((q) => toPublicQuestion(q, includeAnswer)),
    });
  }),
);

quizzesRouter.post(
  "/:id/submit",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const { answers } = z
      .object({ answers: z.array(z.number().int().min(0)) })
      .parse(req.body);

    const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(id) as
      | QuizRow
      | undefined;
    if (!quiz) {
      throw notFound("Quiz not found");
    }
    const questions = db
      .prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY position ASC")
      .all(id) as QuestionRow[];

    let score = 0;
    const results = questions.map((question, index) => {
      const selected = answers[index];
      const correct = selected === question.correct_index;
      if (correct) score += 1;
      return {
        questionId: question.id,
        selected: selected ?? null,
        correctIndex: question.correct_index,
        correct,
      };
    });

    db.prepare(
      "INSERT INTO quiz_attempts (user_id, quiz_id, score, total) VALUES (?, ?, ?, ?)",
    ).run(req.user!.userId, id, score, questions.length);

    res.json({ score, total: questions.length, results });
  }),
);

quizzesRouter.get(
  "/:id/attempts",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const rows = db
      .prepare(
        "SELECT id, score, total, created_at AS createdAt FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY created_at DESC",
      )
      .all(req.user!.userId, id);
    res.json({ attempts: rows });
  }),
);

const questionInputSchema = z.object({
  promptEn: z.string().trim().min(1).max(500),
  promptUr: z.string().trim().max(500).default(""),
  optionsEn: z.array(z.string().trim().min(1)).min(2).max(6),
  optionsUr: z.array(z.string().trim()).default([]),
  correctIndex: z.coerce.number().int().min(0),
});

const quizInputSchema = z.object({
  bookId: idParam,
  titleEn: z.string().trim().min(1).max(200),
  titleUr: z.string().trim().max(200).default(""),
  questions: z.array(questionInputSchema).min(1),
});

quizzesRouter.post(
  "/",
  requireRole("teacher", "admin"),
  asyncHandler(async (req, res) => {
    const data = quizInputSchema.parse(req.body);
    const book = db
      .prepare("SELECT id FROM books WHERE id = ?")
      .get(data.bookId);
    if (!book) {
      throw notFound("Book not found");
    }

    const insertQuiz = db.prepare(
      "INSERT INTO quizzes (book_id, title_en, title_ur) VALUES (?, ?, ?)",
    );
    const insertQuestion = db.prepare(
      `INSERT INTO questions (quiz_id, position, prompt_en, prompt_ur, options_en, options_ur, correct_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    const quizId = db.transaction(() => {
      const result = insertQuiz.run(data.bookId, data.titleEn, data.titleUr);
      const newQuizId = Number(result.lastInsertRowid);
      data.questions.forEach((question, index) => {
        insertQuestion.run(
          newQuizId,
          index,
          question.promptEn,
          question.promptUr,
          JSON.stringify(question.optionsEn),
          JSON.stringify(question.optionsUr),
          Math.min(question.correctIndex, question.optionsEn.length - 1),
        );
      });
      return newQuizId;
    })();

    res.status(201).json({ id: quizId });
  }),
);

quizzesRouter.delete(
  "/:id",
  requireRole("teacher", "admin"),
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const result = db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw notFound("Quiz not found");
    }
    res.status(204).send();
  }),
);

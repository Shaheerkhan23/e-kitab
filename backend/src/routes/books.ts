import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notFound } from "../lib/errors.js";
import {
  toPublicBook,
  toPublicChapter,
  type BookRow,
  type ChapterRow,
  type QuizRow,
} from "../types.js";

export const booksRouter = Router();

booksRouter.use(requireAuth);

const listQuerySchema = z.object({
  grade: z.coerce.number().int().min(1).max(12).optional(),
  board: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

booksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { grade, board, subject, q } = listQuerySchema.parse(req.query);

    const clauses: string[] = [];
    const params: unknown[] = [];
    if (grade !== undefined) {
      clauses.push("grade = ?");
      params.push(grade);
    }
    if (board) {
      clauses.push("board = ?");
      params.push(board);
    }
    if (subject) {
      clauses.push("(subject_en = ? OR subject_ur = ?)");
      params.push(subject, subject);
    }
    if (q) {
      clauses.push(
        "(title_en LIKE ? OR title_ur LIKE ? OR description_en LIKE ?)",
      );
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT * FROM books ${where} ORDER BY grade ASC, subject_en ASC, title_en ASC`,
      )
      .all(...params) as BookRow[];

    res.json({ books: rows.map(toPublicBook) });
  }),
);

booksRouter.get(
  "/filters",
  asyncHandler(async (_req, res) => {
    const grades = (
      db.prepare("SELECT DISTINCT grade FROM books ORDER BY grade").all() as {
        grade: number;
      }[]
    ).map((r) => r.grade);
    const boards = (
      db.prepare("SELECT DISTINCT board FROM books ORDER BY board").all() as {
        board: string;
      }[]
    ).map((r) => r.board);
    const subjects = (
      db
        .prepare("SELECT DISTINCT subject_en FROM books ORDER BY subject_en")
        .all() as { subject_en: string }[]
    ).map((r) => r.subject_en);
    res.json({ grades, boards, subjects });
  }),
);

booksRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id) as
      | BookRow
      | undefined;
    if (!book) {
      throw notFound("Book not found");
    }
    const chapters = db
      .prepare("SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC")
      .all(id) as ChapterRow[];
    const quizzes = db
      .prepare("SELECT * FROM quizzes WHERE book_id = ? ORDER BY id ASC")
      .all(id) as QuizRow[];

    res.json({
      book: toPublicBook(book),
      chapters: chapters.map(toPublicChapter),
      quizzes: quizzes.map((quiz) => ({
        id: quiz.id,
        titleEn: quiz.title_en,
        titleUr: quiz.title_ur,
      })),
    });
  }),
);

const chapterInputSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleUr: z.string().trim().max(200).default(""),
  contentEn: z.string().max(20000).default(""),
  contentUr: z.string().max(20000).default(""),
});

const bookInputSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleUr: z.string().trim().max(200).default(""),
  subjectEn: z.string().trim().min(1).max(80),
  subjectUr: z.string().trim().max(80).default(""),
  grade: z.coerce.number().int().min(1).max(12),
  board: z.string().trim().min(1).max(40).default("FBISE"),
  author: z.string().trim().max(120).default(""),
  descriptionEn: z.string().max(2000).default(""),
  descriptionUr: z.string().max(2000).default(""),
  coverColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #2563eb")
    .default("#2563eb"),
  chapters: z.array(chapterInputSchema).default([]),
});

booksRouter.post(
  "/",
  requireRole("teacher", "admin"),
  asyncHandler(async (req, res) => {
    const data = bookInputSchema.parse(req.body);
    const insertBook = db.prepare(
      `INSERT INTO books
        (title_en, title_ur, subject_en, subject_ur, grade, board, author, description_en, description_ur, cover_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertChapter = db.prepare(
      `INSERT INTO chapters (book_id, position, title_en, title_ur, content_en, content_ur)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );

    const created = db.transaction(() => {
      const result = insertBook.run(
        data.titleEn,
        data.titleUr,
        data.subjectEn,
        data.subjectUr,
        data.grade,
        data.board,
        data.author,
        data.descriptionEn,
        data.descriptionUr,
        data.coverColor,
      );
      const bookId = Number(result.lastInsertRowid);
      data.chapters.forEach((chapter, index) => {
        insertChapter.run(
          bookId,
          index,
          chapter.titleEn,
          chapter.titleUr,
          chapter.contentEn,
          chapter.contentUr,
        );
      });
      return bookId;
    })();

    const book = db
      .prepare("SELECT * FROM books WHERE id = ?")
      .get(created) as BookRow;
    res.status(201).json({ book: toPublicBook(book) });
  }),
);

booksRouter.delete(
  "/:id",
  requireRole("teacher", "admin"),
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const result = db.prepare("DELETE FROM books WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw notFound("Book not found");
    }
    res.status(204).send();
  }),
);

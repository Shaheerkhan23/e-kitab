import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { notFound } from "../lib/errors.js";

export const readerRouter = Router();

readerRouter.use(requireAuth);

const idParam = z.coerce.number().int().positive();

// ---- Bookmarks ----
readerRouter.get(
  "/bookmarks",
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT b.id, b.chapter_id AS chapterId, b.created_at AS createdAt,
                c.title_en AS chapterTitleEn, c.title_ur AS chapterTitleUr,
                c.book_id AS bookId, bk.title_en AS bookTitleEn, bk.title_ur AS bookTitleUr
         FROM bookmarks b
         JOIN chapters c ON c.id = b.chapter_id
         JOIN books bk ON bk.id = c.book_id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`,
      )
      .all(req.user!.userId);
    res.json({ bookmarks: rows });
  }),
);

readerRouter.post(
  "/bookmarks",
  asyncHandler(async (req, res) => {
    const { chapterId } = z
      .object({ chapterId: idParam })
      .parse(req.body);
    const chapter = db
      .prepare("SELECT id FROM chapters WHERE id = ?")
      .get(chapterId);
    if (!chapter) {
      throw notFound("Chapter not found");
    }
    db.prepare(
      "INSERT OR IGNORE INTO bookmarks (user_id, chapter_id) VALUES (?, ?)",
    ).run(req.user!.userId, chapterId);
    res.status(201).json({ ok: true });
  }),
);

readerRouter.delete(
  "/bookmarks/:chapterId",
  asyncHandler(async (req, res) => {
    const chapterId = idParam.parse(req.params.chapterId);
    db.prepare(
      "DELETE FROM bookmarks WHERE user_id = ? AND chapter_id = ?",
    ).run(req.user!.userId, chapterId);
    res.status(204).send();
  }),
);

// ---- Highlights ----
readerRouter.get(
  "/highlights",
  asyncHandler(async (req, res) => {
    const { chapterId } = z
      .object({ chapterId: idParam.optional() })
      .parse(req.query);
    const rows = chapterId
      ? db
          .prepare(
            "SELECT id, chapter_id AS chapterId, text, created_at AS createdAt FROM highlights WHERE user_id = ? AND chapter_id = ? ORDER BY id DESC",
          )
          .all(req.user!.userId, chapterId)
      : db
          .prepare(
            "SELECT id, chapter_id AS chapterId, text, created_at AS createdAt FROM highlights WHERE user_id = ? ORDER BY id DESC",
          )
          .all(req.user!.userId);
    res.json({ highlights: rows });
  }),
);

readerRouter.post(
  "/highlights",
  asyncHandler(async (req, res) => {
    const { chapterId, text } = z
      .object({ chapterId: idParam, text: z.string().trim().min(1).max(2000) })
      .parse(req.body);
    const chapter = db
      .prepare("SELECT id FROM chapters WHERE id = ?")
      .get(chapterId);
    if (!chapter) {
      throw notFound("Chapter not found");
    }
    const result = db
      .prepare(
        "INSERT INTO highlights (user_id, chapter_id, text) VALUES (?, ?, ?)",
      )
      .run(req.user!.userId, chapterId, text);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  }),
);

readerRouter.delete(
  "/highlights/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    db.prepare("DELETE FROM highlights WHERE id = ? AND user_id = ?").run(
      id,
      req.user!.userId,
    );
    res.status(204).send();
  }),
);

// ---- Reading progress ----
readerRouter.get(
  "/progress",
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT p.book_id AS bookId, p.last_chapter_id AS lastChapterId,
                p.percent, p.updated_at AS updatedAt,
                b.title_en AS titleEn, b.title_ur AS titleUr,
                b.subject_en AS subjectEn, b.cover_color AS coverColor
         FROM progress p JOIN books b ON b.id = p.book_id
         WHERE p.user_id = ? ORDER BY p.updated_at DESC`,
      )
      .all(req.user!.userId);
    res.json({ progress: rows });
  }),
);

readerRouter.put(
  "/progress",
  asyncHandler(async (req, res) => {
    const { bookId, lastChapterId, percent } = z
      .object({
        bookId: idParam,
        lastChapterId: idParam.optional(),
        percent: z.coerce.number().int().min(0).max(100),
      })
      .parse(req.body);
    const book = db.prepare("SELECT id FROM books WHERE id = ?").get(bookId);
    if (!book) {
      throw notFound("Book not found");
    }
    db.prepare(
      `INSERT INTO progress (user_id, book_id, last_chapter_id, percent, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, book_id) DO UPDATE SET
         last_chapter_id = excluded.last_chapter_id,
         percent = MAX(progress.percent, excluded.percent),
         updated_at = datetime('now')`,
    ).run(req.user!.userId, bookId, lastChapterId ?? null, percent);
    res.json({ ok: true });
  }),
);

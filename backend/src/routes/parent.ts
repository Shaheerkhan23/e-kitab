import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notFound } from "../lib/errors.js";

export const parentRouter = Router();

parentRouter.use(requireAuth, requireRole("parent", "admin"));

const idParam = z.coerce.number().int().positive();

parentRouter.get(
  "/children",
  asyncHandler(async (req, res) => {
    const children = db
      .prepare(
        `SELECT u.id, u.name, u.email, u.grade,
                (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS booksStarted,
                (SELECT COALESCE(ROUND(AVG(percent)), 0) FROM progress p WHERE p.user_id = u.id) AS avgProgress,
                (SELECT COUNT(*) FROM quiz_attempts a WHERE a.user_id = u.id) AS quizzesTaken,
                (SELECT COALESCE(ROUND(AVG(CAST(score AS REAL) / NULLIF(total,0) * 100)), 0)
                   FROM quiz_attempts a WHERE a.user_id = u.id) AS avgScore
         FROM parent_children pc
         JOIN users u ON u.id = pc.child_id
         WHERE pc.parent_id = ?
         ORDER BY u.name ASC`,
      )
      .all(req.user!.userId);
    res.json({ children });
  }),
);

parentRouter.get(
  "/children/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const link = db
      .prepare(
        "SELECT 1 FROM parent_children WHERE parent_id = ? AND child_id = ?",
      )
      .get(req.user!.userId, id);
    if (!link) {
      throw notFound("Child not found");
    }
    const child = db
      .prepare("SELECT id, name, email, grade FROM users WHERE id = ?")
      .get(id);
    const progress = db
      .prepare(
        `SELECT p.percent, p.updated_at AS updatedAt, b.title_en AS titleEn, b.subject_en AS subjectEn
         FROM progress p JOIN books b ON b.id = p.book_id
         WHERE p.user_id = ? ORDER BY p.updated_at DESC`,
      )
      .all(id);
    const attempts = db
      .prepare(
        `SELECT a.score, a.total, a.created_at AS createdAt, q.title_en AS quizTitleEn
         FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id
         WHERE a.user_id = ? ORDER BY a.created_at DESC`,
      )
      .all(id);
    const assignments = db
      .prepare(
        `SELECT a.id, a.note, a.due_date AS dueDate, a.created_at AS createdAt,
                a.book_id AS bookId, a.quiz_id AS quizId,
                b.title_en AS bookTitleEn, q.title_en AS quizTitleEn,
                t.name AS teacherName
         FROM assignments a
         LEFT JOIN books b ON b.id = a.book_id
         LEFT JOIN quizzes q ON q.id = a.quiz_id
         JOIN users t ON t.id = a.teacher_id
         WHERE a.student_id = ? ORDER BY a.created_at DESC`,
      )
      .all(id);
    res.json({ student: child, progress, attempts, assignments });
  }),
);

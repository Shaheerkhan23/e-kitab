import { Router } from "express";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

export const studentRouter = Router();

studentRouter.use(requireAuth);

studentRouter.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const progress = db
      .prepare(
        `SELECT p.book_id AS bookId, p.percent, p.updated_at AS updatedAt,
                b.title_en AS titleEn, b.title_ur AS titleUr,
                b.subject_en AS subjectEn, b.cover_color AS coverColor
         FROM progress p JOIN books b ON b.id = p.book_id
         WHERE p.user_id = ? ORDER BY p.updated_at DESC`,
      )
      .all(userId);

    const attempts = db
      .prepare(
        `SELECT a.id, a.score, a.total, a.created_at AS createdAt,
                q.title_en AS quizTitleEn, q.id AS quizId
         FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id
         WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 10`,
      )
      .all(userId);

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
      .all(userId);

    const stats = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM progress WHERE user_id = ?) AS booksStarted,
           (SELECT COUNT(*) FROM progress WHERE user_id = ? AND percent >= 100) AS booksCompleted,
           (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ?) AS quizzesTaken,
           (SELECT COALESCE(ROUND(AVG(CAST(score AS REAL) / NULLIF(total, 0) * 100)), 0)
              FROM quiz_attempts WHERE user_id = ?) AS averageScore`,
      )
      .get(userId, userId, userId, userId);

    res.json({ progress, attempts, assignments, stats });
  }),
);

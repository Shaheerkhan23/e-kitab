import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notFound } from "../lib/errors.js";

export const teacherRouter = Router();

teacherRouter.use(requireAuth, requireRole("teacher", "admin"));

const idParam = z.coerce.number().int().positive();

teacherRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const stats = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
           (SELECT COUNT(*) FROM books) AS books,
           (SELECT COUNT(*) FROM quizzes) AS quizzes,
           (SELECT COUNT(*) FROM quiz_attempts) AS attempts`,
      )
      .get();
    res.json({ stats });
  }),
);

teacherRouter.get(
  "/students",
  asyncHandler(async (_req, res) => {
    const students = db
      .prepare(
        `SELECT u.id, u.name, u.email, u.grade,
                (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS booksStarted,
                (SELECT COALESCE(ROUND(AVG(percent)), 0) FROM progress p WHERE p.user_id = u.id) AS avgProgress,
                (SELECT COUNT(*) FROM quiz_attempts a WHERE a.user_id = u.id) AS quizzesTaken,
                (SELECT COALESCE(ROUND(AVG(CAST(score AS REAL) / NULLIF(total,0) * 100)), 0)
                   FROM quiz_attempts a WHERE a.user_id = u.id) AS avgScore
         FROM users u WHERE u.role = 'student'
         ORDER BY u.name ASC`,
      )
      .all();
    res.json({ students });
  }),
);

teacherRouter.get(
  "/students/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const student = db
      .prepare(
        "SELECT id, name, email, grade FROM users WHERE id = ? AND role = 'student'",
      )
      .get(id);
    if (!student) {
      throw notFound("Student not found");
    }
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
    res.json({ student, progress, attempts });
  }),
);

teacherRouter.get(
  "/quizzes",
  asyncHandler(async (_req, res) => {
    const quizzes = db
      .prepare(
        `SELECT q.id, q.title_en AS titleEn, q.title_ur AS titleUr,
                b.title_en AS bookTitleEn
         FROM quizzes q JOIN books b ON b.id = q.book_id
         ORDER BY b.title_en ASC, q.id ASC`,
      )
      .all();
    res.json({ quizzes });
  }),
);

// ---- Assignments ----
teacherRouter.get(
  "/assignments",
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT a.id, a.note, a.due_date AS dueDate, a.created_at AS createdAt,
                s.name AS studentName, s.id AS studentId,
                b.title_en AS bookTitleEn, q.title_en AS quizTitleEn
         FROM assignments a
         JOIN users s ON s.id = a.student_id
         LEFT JOIN books b ON b.id = a.book_id
         LEFT JOIN quizzes q ON q.id = a.quiz_id
         WHERE a.teacher_id = ? ORDER BY a.created_at DESC`,
      )
      .all(req.user!.userId);
    res.json({ assignments: rows });
  }),
);

const assignmentSchema = z
  .object({
    studentId: idParam,
    bookId: idParam.optional(),
    quizId: idParam.optional(),
    note: z.string().trim().max(500).default(""),
    dueDate: z.string().trim().optional(),
  })
  .refine((data) => data.bookId || data.quizId, {
    message: "Attach a book or a quiz to the assignment",
  });

teacherRouter.post(
  "/assignments",
  asyncHandler(async (req, res) => {
    const data = assignmentSchema.parse(req.body);
    const student = db
      .prepare("SELECT id FROM users WHERE id = ? AND role = 'student'")
      .get(data.studentId);
    if (!student) {
      throw notFound("Student not found");
    }
    const result = db
      .prepare(
        `INSERT INTO assignments (teacher_id, student_id, book_id, quiz_id, note, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        req.user!.userId,
        data.studentId,
        data.bookId ?? null,
        data.quizId ?? null,
        data.note,
        data.dueDate ?? null,
      );
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  }),
);

teacherRouter.delete(
  "/assignments/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const result = db
      .prepare("DELETE FROM assignments WHERE id = ? AND teacher_id = ?")
      .run(id, req.user!.userId);
    if (result.changes === 0) {
      throw notFound("Assignment not found");
    }
    res.status(204).send();
  }),
);

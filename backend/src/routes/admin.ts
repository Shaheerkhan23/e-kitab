import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, notFound } from "../lib/errors.js";
import { toPublicUser, type UserRow } from "../types.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

const idParam = z.coerce.number().int().positive();

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM users) AS users,
           (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
           (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS teachers,
           (SELECT COUNT(*) FROM users WHERE role = 'parent') AS parents,
           (SELECT COUNT(*) FROM books) AS books,
           (SELECT COUNT(*) FROM quizzes) AS quizzes,
           (SELECT COUNT(*) FROM quiz_attempts) AS attempts`,
      )
      .get();
    res.json({ stats });
  }),
);

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM users ORDER BY created_at DESC")
      .all() as UserRow[];
    res.json({ users: rows.map(toPublicUser) });
  }),
);

const updateUserSchema = z.object({
  role: z.enum(["student", "teacher", "admin", "parent"]).optional(),
  grade: z.coerce.number().int().min(1).max(12).nullable().optional(),
});

adminRouter.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const updates = updateUserSchema.parse(req.body);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | UserRow
      | undefined;
    if (!user) {
      throw notFound("User not found");
    }
    const role = updates.role ?? user.role;
    const grade = updates.grade === undefined ? user.grade : updates.grade;
    db.prepare("UPDATE users SET role = ?, grade = ? WHERE id = ?").run(
      role,
      grade,
      id,
    );
    const updated = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as UserRow;
    res.json({ user: toPublicUser(updated) });
  }),
);

adminRouter.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);
    if (id === req.user!.userId) {
      throw badRequest("You cannot delete your own account");
    }
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw notFound("User not found");
    }
    res.status(204).send();
  }),
);

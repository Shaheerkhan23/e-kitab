import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { conflict, notFound, unauthorized } from "../lib/errors.js";
import { toPublicUser, type UserRow } from "../types.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  name: z.string().trim().min(1, "Name is required").max(80),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "teacher"]).default("student"),
  grade: z.coerce.number().int().min(1).max(12).optional(),
  preferredLanguage: z.enum(["en", "ur"]).default("en"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

function tokenFor(user: UserRow): string {
  return signToken({ userId: user.id, email: user.email, role: user.role });
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, name, password, role, grade, preferredLanguage } =
      registerSchema.parse(req.body);

    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existing) {
      throw conflict("An account with that email already exists");
    }

    const passwordHash = await hashPassword(password);
    const result = db
      .prepare(
        `INSERT INTO users (email, name, password_hash, role, grade, preferred_language)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        email,
        name,
        passwordHash,
        role,
        grade ?? null,
        preferredLanguage,
      );

    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(result.lastInsertRowid) as UserRow;

    res.status(201).json({ token: tokenFor(user), user: toPublicUser(user) });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as UserRow | undefined;
    if (!user) {
      throw unauthorized("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      throw unauthorized("Invalid email or password");
    }

    res.json({ token: tokenFor(user), user: toPublicUser(user) });
  }),
);

const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  grade: z.coerce.number().int().min(1).max(12).nullable().optional(),
  preferredLanguage: z.enum(["en", "ur"]).optional(),
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.user!.userId) as UserRow | undefined;
    if (!user) {
      throw notFound("User not found");
    }
    res.json({ user: toPublicUser(user) });
  }),
);

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = updateMeSchema.parse(req.body);
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.user!.userId) as UserRow | undefined;
    if (!user) {
      throw notFound("User not found");
    }

    const name = updates.name ?? user.name;
    const grade =
      updates.grade === undefined ? user.grade : updates.grade;
    const preferredLanguage =
      updates.preferredLanguage ?? user.preferred_language;

    db.prepare(
      "UPDATE users SET name = ?, grade = ?, preferred_language = ? WHERE id = ?",
    ).run(name, grade, preferredLanguage, user.id);

    const updated = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(user.id) as UserRow;
    res.json({ user: toPublicUser(updated) });
  }),
);

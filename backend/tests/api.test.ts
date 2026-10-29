import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  process.env.DATABASE_PATH = ":memory:";
  process.env.JWT_SECRET = "test-secret";
  process.env.NODE_ENV = "test";
  const { createApp } = await import("../src/app.js");
  const { seed } = await import("../src/db/seed.js");
  seed();
  app = createApp();
});

async function login(email: string, password = "Password123"): Promise<string> {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

describe("health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("auth", () => {
  it("registers a new student", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "newstudent@example.com",
      name: "New Student",
      password: "password123",
      role: "student",
      grade: 5,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("student");
    expect(res.body.token).toBeTypeOf("string");
  });

  it("rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "student@ekitab.pk",
      name: "Dup",
      password: "password123",
    });
    expect(res.status).toBe(409);
  });

  it("logs in the seeded student", async () => {
    const token = await login("student@ekitab.pk");
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe("student@ekitab.pk");
  });
});

describe("library", () => {
  it("lists seeded books and filters by grade", async () => {
    const token = await login("student@ekitab.pk");
    const all = await request(app)
      .get("/api/books")
      .set("Authorization", `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.books.length).toBeGreaterThan(0);

    const grade8 = await request(app)
      .get("/api/books?grade=8")
      .set("Authorization", `Bearer ${token}`);
    expect(grade8.body.books.every((b: { grade: number }) => b.grade === 8)).toBe(
      true,
    );
  });

  it("returns a book with chapters", async () => {
    const token = await login("student@ekitab.pk");
    const detail = await request(app)
      .get("/api/books/1")
      .set("Authorization", `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.chapters.length).toBeGreaterThan(0);
    expect(detail.body.chapters[0].contentEn).toBeTypeOf("string");
  });
});

describe("quizzes", () => {
  it("hides answers from students but scores submissions", async () => {
    const token = await login("student@ekitab.pk");
    const quiz = await request(app)
      .get("/api/quizzes/1")
      .set("Authorization", `Bearer ${token}`);
    expect(quiz.status).toBe(200);
    expect(quiz.body.questions[0].correctIndex).toBeUndefined();

    const submit = await request(app)
      .post("/api/quizzes/1/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ answers: [1, 1, 2] });
    expect(submit.status).toBe(200);
    expect(submit.body.total).toBe(3);
    expect(submit.body.score).toBe(3);
  });

  it("shows answers to teachers", async () => {
    const token = await login("teacher@ekitab.pk");
    const quiz = await request(app)
      .get("/api/quizzes/1")
      .set("Authorization", `Bearer ${token}`);
    expect(quiz.body.questions[0].correctIndex).toBeTypeOf("number");
  });
});

describe("reader", () => {
  it("saves progress and bookmarks", async () => {
    const token = await login("student@ekitab.pk");
    const progress = await request(app)
      .put("/api/reader/progress")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId: 1, lastChapterId: 1, percent: 50 });
    expect(progress.status).toBe(200);

    const bookmark = await request(app)
      .post("/api/reader/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ chapterId: 1 });
    expect(bookmark.status).toBe(201);

    const list = await request(app)
      .get("/api/reader/bookmarks")
      .set("Authorization", `Bearer ${token}`);
    expect(list.body.bookmarks.length).toBe(1);
  });
});

describe("role enforcement", () => {
  it("blocks students from teacher routes", async () => {
    const token = await login("student@ekitab.pk");
    const res = await request(app)
      .get("/api/teacher/students")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("allows teachers to list students", async () => {
    const token = await login("teacher@ekitab.pk");
    const res = await request(app)
      .get("/api/teacher/students")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.students)).toBe(true);
  });

  it("blocks teachers from admin routes", async () => {
    const token = await login("teacher@ekitab.pk");
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe("seeded activity", () => {
  it("returns populated dashboard for the seeded student", async () => {
    const token = await login("student@ekitab.pk");
    const res = await request(app)
      .get("/api/student/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.progress.length).toBeGreaterThan(0);
    expect(res.body.attempts.length).toBeGreaterThan(0);
    expect(res.body.assignments.length).toBeGreaterThan(0);
    expect(res.body.stats.quizzesTaken).toBeGreaterThan(0);
  });
});

describe("parent", () => {
  it("lists linked children with progress stats", async () => {
    const token = await login("parent@ekitab.pk");
    const res = await request(app)
      .get("/api/parent/children")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.children.length).toBeGreaterThan(0);
    expect(res.body.children[0]).toHaveProperty("avgProgress");
  });

  it("returns a child's detailed progress and quiz history", async () => {
    const token = await login("parent@ekitab.pk");
    const list = await request(app)
      .get("/api/parent/children")
      .set("Authorization", `Bearer ${token}`);
    const childId = list.body.children[0].id as number;
    const detail = await request(app)
      .get(`/api/parent/children/${childId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.student.id).toBe(childId);
    expect(Array.isArray(detail.body.progress)).toBe(true);
    expect(Array.isArray(detail.body.assignments)).toBe(true);
  });

  it("blocks parents from viewing an unlinked child", async () => {
    const token = await login("parent@ekitab.pk");
    const res = await request(app)
      .get("/api/parent/children/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("blocks students from parent routes", async () => {
    const token = await login("student@ekitab.pk");
    const res = await request(app)
      .get("/api/parent/children")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("registers a parent and links them to a child by email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "newparent@example.com",
      name: "New Parent",
      password: "password123",
      role: "parent",
      childEmail: "student@ekitab.pk",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("parent");
    const children = await request(app)
      .get("/api/parent/children")
      .set("Authorization", `Bearer ${res.body.token}`);
    expect(children.body.children.length).toBe(1);
    expect(children.body.children[0].email).toBe("student@ekitab.pk");
  });
});

describe("teacher assignments", () => {
  it("creates a quiz assignment and lists teacher quizzes", async () => {
    const token = await login("teacher@ekitab.pk");
    const quizzes = await request(app)
      .get("/api/teacher/quizzes")
      .set("Authorization", `Bearer ${token}`);
    expect(quizzes.status).toBe(200);
    expect(quizzes.body.quizzes.length).toBeGreaterThan(0);

    const students = await request(app)
      .get("/api/teacher/students")
      .set("Authorization", `Bearer ${token}`);
    const studentId = students.body.students[0].id as number;
    const created = await request(app)
      .post("/api/teacher/assignments")
      .set("Authorization", `Bearer ${token}`)
      .send({ studentId, quizId: quizzes.body.quizzes[0].id, note: "Do this" });
    expect(created.status).toBe(201);
  });
});

describe("chat assistant", () => {
  it("answers questions from book content", async () => {
    const token = await login("student@ekitab.pk");
    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "explain photosynthesis", bookId: 1 });
    expect(res.status).toBe(200);
    expect(res.body.reply.toLowerCase()).toContain("photosynthesis");
    expect(res.body.sources.length).toBeGreaterThan(0);
  });
});

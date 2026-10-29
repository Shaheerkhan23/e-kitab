import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { env } from "../lib/env.js";

function createDatabase(path: string): Database.Database {
  if (path !== ":memory:") {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  const database = new Database(path);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  return database;
}

export const db = createDatabase(env.databasePath);

export function migrate(database: Database.Database = db): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','admin','parent')),
      grade INTEGER,
      preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','ur')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ur TEXT NOT NULL DEFAULT '',
      subject_en TEXT NOT NULL,
      subject_ur TEXT NOT NULL DEFAULT '',
      grade INTEGER NOT NULL,
      board TEXT NOT NULL DEFAULT 'FBISE',
      author TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      description_ur TEXT NOT NULL DEFAULT '',
      cover_color TEXT NOT NULL DEFAULT '#2563eb',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      title_en TEXT NOT NULL,
      title_ur TEXT NOT NULL DEFAULT '',
      content_en TEXT NOT NULL DEFAULT '',
      content_ur TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id);

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      title_en TEXT NOT NULL,
      title_ur TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_quizzes_book ON quizzes(book_id);

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      prompt_en TEXT NOT NULL,
      prompt_ur TEXT NOT NULL DEFAULT '',
      options_en TEXT NOT NULL DEFAULT '[]',
      options_ur TEXT NOT NULL DEFAULT '[]',
      correct_index INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chapter_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, chapter_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chapter_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_highlights_user ON highlights(user_id, chapter_id);

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      last_chapter_id INTEGER,
      percent INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, book_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      book_id INTEGER,
      quiz_id INTEGER,
      note TEXT NOT NULL DEFAULT '',
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);

    CREATE TABLE IF NOT EXISTS parent_children (
      parent_id INTEGER NOT NULL,
      child_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (parent_id, child_id),
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
  `);
}

migrate();

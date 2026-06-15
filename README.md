# E-Kitab — Learning App for Pakistani Schools

A bilingual (English / اردو) full-stack digital learning platform aligned with
Pakistani school curricula. Students read interactive textbooks, listen to audio
narration, take auto-scored quizzes, track their progress, and ask a built-in
study assistant. Teachers monitor students and assign work; admins manage users
and the catalog.

> Built as a single, self-contained web app (no external services required).
> React + Vite frontend, Express + SQLite backend.

## Features

- **Bilingual UI** — full English/Urdu toggle with right-to-left layout for Urdu.
- **Digital textbook library** — browse, search, and filter by grade, subject,
  and board (PTB, STBB, KPTB, FBISE).
- **E-Kitab reader** — chapter navigation, adjustable font size, bookmarks, and
  text highlights.
- **Audio narration** — text-to-speech for the current page (Web Speech API).
- **One-click summary** — extractive summary of any chapter.
- **Interactive quizzes** — multiple-choice, auto-scored, with attempt history.
- **Progress tracking & analytics** — reading progress and quiz dashboards.
- **Teacher dashboard** — student roster, click a student to drill into their
  full progress and quiz history, and assign books **or** quizzes.
- **Parent portal** — parents link to their children and monitor each child's
  progress, quiz scores, and assignments.
- **Admin panel** — manage users (roles, grades) and view platform stats.
- **Study assistant** — a rule-based chatbot that answers from book content.
- **Seeded content** — sample bilingual Pakistani-curriculum books + demo
  accounts so it works on first run.

## Tech stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Frontend | React 18, Vite, TypeScript, React Router              |
| Backend  | Node 20+, Express, TypeScript                         |
| Database | SQLite via `better-sqlite3`                           |
| Auth     | JWT (`jsonwebtoken`) + `bcryptjs` password hashing    |
| Tests    | Vitest + Supertest                                    |

## Project structure

```
fullstackfinal-app/
├── backend/          Express API + SQLite (auth, books, reader, quizzes, ...)
│   ├── src/
│   │   ├── routes/   auth, books, reader, quizzes, student, teacher, admin, chat
│   │   ├── db/       schema + seed data
│   │   ├── lib/      env, auth, errors
│   │   └── middleware/
│   └── tests/        API tests (Vitest + Supertest)
├── frontend/         React + Vite app
│   └── src/
│       ├── pages/    library, reader, quiz, dashboards, admin, auth
│       ├── components/
│       ├── context/  auth context
│       └── i18n.tsx  EN/UR translations + RTL
└── package.json      npm workspaces + one-command dev
```

## Getting started

Requirements: **Node.js 20+**.

```bash
# 1. Install all dependencies (root + both workspaces)
npm install

# 2. Start backend (http://localhost:4000) and frontend (http://localhost:5173)
npm run dev
```

Open <http://localhost:5173>. The database is created and seeded automatically on
first run (`backend/data/app.sqlite`).

### Demo accounts

| Role    | Email               | Password      |
| ------- | ------------------- | ------------- |
| Student | `student@ekitab.pk` | `Password123` |
| Teacher | `teacher@ekitab.pk` | `Password123` |
| Parent  | `parent@ekitab.pk`  | `Password123` |
| Admin   | `admin@ekitab.pk`   | `Password123` |

## Available scripts

Run from the repo root:

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Run backend + frontend together              |
| `npm run build`    | Type-check and build both workspaces         |
| `npm run start`    | Run the built backend                        |
| `npm run lint`     | Lint the whole monorepo                       |
| `npm run typecheck`| Type-check both workspaces                    |
| `npm run test`     | Run backend API tests                        |

Re-seed the database manually with `npm run seed --workspace backend`.

## Configuration

Backend environment variables (see `backend/.env.example`):

| Variable         | Default                   | Description                       |
| ---------------- | ------------------------- | --------------------------------- |
| `PORT`           | `4000`                    | API port                          |
| `JWT_SECRET`     | `change-me-...`           | Token signing secret              |
| `JWT_EXPIRES_IN` | `7d`                      | Token lifetime                    |
| `DATABASE_PATH`  | `./data/app.sqlite`       | SQLite file (`:memory:` for tests)|
| `CORS_ORIGIN`    | `http://localhost:5173`   | Allowed origin(s), comma-separated|

## API overview

All routes are under `/api`. Protected routes require an
`Authorization: Bearer <token>` header.

- `auth` — `POST /auth/register`, `POST /auth/login`, `GET/PATCH /auth/me`
- `books` — `GET /books`, `GET /books/filters`, `GET /books/:id`, `POST /books`
- `reader` — bookmarks, highlights, and reading `progress`
- `quizzes` — `GET /quizzes/:id`, `POST /quizzes/:id/submit`, attempts, authoring
- `student` — `GET /student/dashboard`
- `teacher` — overview, students roster, per-student detail, quizzes list,
  assignments (role: teacher/admin)
- `parent` — `GET /parent/children`, `GET /parent/children/:id` (role:
  parent/admin)
- `admin` — stats and user management (role: admin)
- `chat` — `POST /chat` study assistant

## Notes & scope

To keep the app fully self-contained and runnable out of the box, this build
uses React + SQLite instead of the original proposal's Flutter + MongoDB. Native
mobile, live machine translation, and offline PWA support are out of scope for
this version. Urdu content is seeded directly rather than auto-translated.

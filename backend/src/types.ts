export type Role = "student" | "teacher" | "admin";
export type Language = "en" | "ur";

export interface UserRow {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: Role;
  grade: number | null;
  preferred_language: Language;
  created_at: string;
}

export interface BookRow {
  id: number;
  title_en: string;
  title_ur: string;
  subject_en: string;
  subject_ur: string;
  grade: number;
  board: string;
  author: string;
  description_en: string;
  description_ur: string;
  cover_color: string;
  created_at: string;
}

export interface ChapterRow {
  id: number;
  book_id: number;
  position: number;
  title_en: string;
  title_ur: string;
  content_en: string;
  content_ur: string;
}

export interface QuizRow {
  id: number;
  book_id: number;
  title_en: string;
  title_ur: string;
}

export interface QuestionRow {
  id: number;
  quiz_id: number;
  position: number;
  prompt_en: string;
  prompt_ur: string;
  options_en: string;
  options_ur: string;
  correct_index: number;
}

export interface AttemptRow {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total: number;
  created_at: string;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  grade: number | null;
  preferredLanguage: Language;
  createdAt: string;
}

export interface PublicBook {
  id: number;
  titleEn: string;
  titleUr: string;
  subjectEn: string;
  subjectUr: string;
  grade: number;
  board: string;
  author: string;
  descriptionEn: string;
  descriptionUr: string;
  coverColor: string;
  createdAt: string;
}

export interface PublicChapter {
  id: number;
  bookId: number;
  position: number;
  titleEn: string;
  titleUr: string;
  contentEn: string;
  contentUr: string;
}

export interface PublicQuestion {
  id: number;
  position: number;
  promptEn: string;
  promptUr: string;
  optionsEn: string[];
  optionsUr: string[];
  /** Only included for teachers/admins authoring content. */
  correctIndex?: number;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    grade: row.grade,
    preferredLanguage: row.preferred_language,
    createdAt: row.created_at,
  };
}

export function toPublicBook(row: BookRow): PublicBook {
  return {
    id: row.id,
    titleEn: row.title_en,
    titleUr: row.title_ur,
    subjectEn: row.subject_en,
    subjectUr: row.subject_ur,
    grade: row.grade,
    board: row.board,
    author: row.author,
    descriptionEn: row.description_en,
    descriptionUr: row.description_ur,
    coverColor: row.cover_color,
    createdAt: row.created_at,
  };
}

export function toPublicChapter(row: ChapterRow): PublicChapter {
  return {
    id: row.id,
    bookId: row.book_id,
    position: row.position,
    titleEn: row.title_en,
    titleUr: row.title_ur,
    contentEn: row.content_en,
    contentUr: row.content_ur,
  };
}

function parseStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // fall through
  }
  return [];
}

export function toPublicQuestion(
  row: QuestionRow,
  includeAnswer: boolean,
): PublicQuestion {
  const question: PublicQuestion = {
    id: row.id,
    position: row.position,
    promptEn: row.prompt_en,
    promptUr: row.prompt_ur,
    optionsEn: parseStringArray(row.options_en),
    optionsUr: parseStringArray(row.options_ur),
  };
  if (includeAnswer) {
    question.correctIndex = row.correct_index;
  }
  return question;
}

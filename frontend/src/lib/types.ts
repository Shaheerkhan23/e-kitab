export type Role = "student" | "teacher" | "admin" | "parent";
export type Language = "en" | "ur";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  grade: number | null;
  preferredLanguage: Language;
  createdAt: string;
}

export interface Book {
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

export interface Chapter {
  id: number;
  bookId: number;
  position: number;
  titleEn: string;
  titleUr: string;
  contentEn: string;
  contentUr: string;
}

export interface QuizSummary {
  id: number;
  titleEn: string;
  titleUr: string;
}

export interface Question {
  id: number;
  position: number;
  promptEn: string;
  promptUr: string;
  optionsEn: string[];
  optionsUr: string[];
  correctIndex?: number;
}

export interface QuizDetail {
  quiz: { id: number; titleEn: string; titleUr: string; bookId: number };
  questions: Question[];
}

export interface QuizResult {
  score: number;
  total: number;
  results: {
    questionId: number;
    selected: number | null;
    correctIndex: number;
    correct: boolean;
  }[];
}

export interface Bookmark {
  id: number;
  chapterId: number;
  bookId: number;
  chapterTitleEn: string;
  chapterTitleUr: string;
  bookTitleEn: string;
  bookTitleUr: string;
  createdAt: string;
}

export interface Highlight {
  id: number;
  chapterId: number;
  text: string;
  createdAt: string;
}

export interface ProgressItem {
  bookId: number;
  percent: number;
  updatedAt: string;
  titleEn: string;
  titleUr: string;
  subjectEn: string;
  coverColor: string;
}

export interface AttemptItem {
  id: number;
  score: number;
  total: number;
  createdAt: string;
  quizTitleEn: string;
  quizId: number;
}

export interface AssignmentItem {
  id: number;
  note: string;
  dueDate: string | null;
  createdAt: string;
  bookId: number | null;
  quizId: number | null;
  bookTitleEn: string | null;
  quizTitleEn: string | null;
  teacherName: string;
}

export interface StudentDashboard {
  progress: ProgressItem[];
  attempts: AttemptItem[];
  assignments: AssignmentItem[];
  stats: {
    booksStarted: number;
    booksCompleted: number;
    quizzesTaken: number;
    averageScore: number;
  };
}

export interface StudentSummary {
  id: number;
  name: string;
  email: string;
  grade: number | null;
  booksStarted: number;
  avgProgress: number;
  quizzesTaken: number;
  avgScore: number;
}

export interface TeacherAssignment {
  id: number;
  note: string;
  dueDate: string | null;
  createdAt: string;
  studentName: string;
  studentId: number;
  bookTitleEn: string | null;
  quizTitleEn: string | null;
}

export interface ChildSummary {
  id: number;
  name: string;
  email: string;
  grade: number | null;
  booksStarted: number;
  avgProgress: number;
  quizzesTaken: number;
  avgScore: number;
}

export interface StudentProgressRow {
  percent: number;
  updatedAt: string;
  titleEn: string;
  subjectEn: string;
}

export interface StudentAttemptRow {
  score: number;
  total: number;
  createdAt: string;
  quizTitleEn: string;
}

export interface StudentDetail {
  student: { id: number; name: string; email: string; grade: number | null };
  progress: StudentProgressRow[];
  attempts: StudentAttemptRow[];
  assignments?: AssignmentItem[];
}

export interface QuizListItem {
  id: number;
  titleEn: string;
  titleUr: string;
  bookTitleEn: string;
}

export interface ChatSource {
  bookId: number;
  chapterId: number;
  title: string;
}

export interface ChatResponse {
  reply: string;
  sources: ChatSource[];
}

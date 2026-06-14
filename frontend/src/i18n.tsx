import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "./lib/types";

type Dict = Record<string, { en: string; ur: string }>;

const strings: Dict = {
  appName: { en: "E-Kitab", ur: "\u0627\u06cc \u06a9\u062a\u0627\u0628" },
  tagline: {
    en: "Learning App for Pakistani Schools",
    ur: "\u067e\u0627\u06a9\u0633\u062a\u0627\u0646\u06cc \u0627\u0633\u06a9\u0648\u0644\u0648\u06ba \u06a9\u06d2 \u0644\u06cc\u06d2 \u062a\u0639\u0644\u06cc\u0645\u06cc \u0627\u06cc\u067e",
  },
  login: { en: "Log in", ur: "\u0644\u0627\u06af \u0627\u0646" },
  register: { en: "Sign up", ur: "\u0631\u062c\u0633\u0679\u0631 \u06a9\u0631\u06cc\u06ba" },
  logout: { en: "Log out", ur: "\u0644\u0627\u06af \u0622\u0624\u0679" },
  email: { en: "Email", ur: "\u0627\u06cc \u0645\u06cc\u0644" },
  password: { en: "Password", ur: "\u067e\u0627\u0633 \u0648\u0631\u0688" },
  name: { en: "Full name", ur: "\u067e\u0648\u0631\u0627 \u0646\u0627\u0645" },
  role: { en: "I am a", ur: "\u0645\u06cc\u06ba \u06c1\u0648\u06ba" },
  student: { en: "Student", ur: "\u0637\u0627\u0644\u0628 \u0639\u0644\u0645" },
  teacher: { en: "Teacher", ur: "\u0627\u0633\u062a\u0627\u062f" },
  admin: { en: "Admin", ur: "\u0645\u0646\u062a\u0638\u0645" },
  grade: { en: "Grade", ur: "\u062c\u0645\u0627\u0639\u062a" },
  library: { en: "Library", ur: "\u0644\u0627\u0626\u0628\u0631\u06cc\u0631\u06cc" },
  dashboard: { en: "Dashboard", ur: "\u0688\u06cc\u0634 \u0628\u0648\u0631\u0688" },
  teacherPanel: { en: "Teacher", ur: "\u0627\u0633\u062a\u0627\u062f" },
  adminPanel: { en: "Admin", ur: "\u0645\u0646\u062a\u0638\u0645" },
  profile: { en: "Profile", ur: "\u067e\u0631\u0648\u0641\u0627\u0626\u0644" },
  search: { en: "Search books...", ur: "\u06a9\u062a\u0627\u0628\u06cc\u06ba \u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba..." },
  allGrades: { en: "All grades", ur: "\u062a\u0645\u0627\u0645 \u062c\u0645\u0627\u0639\u062a\u06cc\u06ba" },
  allSubjects: { en: "All subjects", ur: "\u062a\u0645\u0627\u0645 \u0645\u0636\u0627\u0645\u06cc\u0646" },
  allBoards: { en: "All boards", ur: "\u062a\u0645\u0627\u0645 \u0628\u0648\u0631\u0688" },
  read: { en: "Read", ur: "\u067e\u0691\u06be\u06cc\u06ba" },
  startReading: { en: "Start reading", ur: "\u067e\u0691\u06be\u0646\u0627 \u0634\u0631\u0648\u0639 \u06a9\u0631\u06cc\u06ba" },
  continueReading: { en: "Continue", ur: "\u062c\u0627\u0631\u06cc \u0631\u06a9\u06be\u06cc\u06ba" },
  takeQuiz: { en: "Take quiz", ur: "\u06a9\u0648\u0626\u0632 \u062f\u06cc\u06ba" },
  chapters: { en: "Chapters", ur: "\u0627\u0628\u0648\u0627\u0628" },
  quizzes: { en: "Quizzes", ur: "\u06a9\u0648\u0626\u0632" },
  next: { en: "Next", ur: "\u0627\u06af\u0644\u0627" },
  previous: { en: "Previous", ur: "\u067e\u0686\u06be\u0644\u0627" },
  listen: { en: "Listen", ur: "\u0633\u0646\u06cc\u06ba" },
  stop: { en: "Stop", ur: "\u0631\u0648\u06a9\u06cc\u06ba" },
  summarize: { en: "Summarize", ur: "\u062e\u0644\u0627\u0635\u06c1" },
  summary: { en: "Summary", ur: "\u062e\u0644\u0627\u0635\u06c1" },
  bookmark: { en: "Bookmark", ur: "\u0646\u0634\u0627\u0646\u06cc" },
  bookmarked: { en: "Bookmarked", ur: "\u0646\u0634\u0627\u0646 \u0632\u062f" },
  highlight: { en: "Highlight selection", ur: "\u0646\u0645\u0627\u06cc\u0627\u06ba \u06a9\u0631\u06cc\u06ba" },
  highlights: { en: "Highlights", ur: "\u0646\u0645\u0627\u06cc\u0627\u06ba \u0627\u0642\u062a\u0628\u0627\u0633\u0627\u062a" },
  fontSize: { en: "Font size", ur: "\u0631\u0633\u0645 \u0627\u0644\u062e\u0637 \u0633\u0627\u0626\u0632" },
  submit: { en: "Submit", ur: "\u062c\u0645\u0639 \u06a9\u0631\u0627\u0626\u06cc\u06ba" },
  score: { en: "Score", ur: "\u0627\u0633\u06a9\u0648\u0631" },
  tryAgain: { en: "Try again", ur: "\u062f\u0648\u0628\u0627\u0631\u06c1 \u06a9\u0648\u0634\u0634" },
  correct: { en: "Correct", ur: "\u062f\u0631\u0633\u062a" },
  incorrect: { en: "Incorrect", ur: "\u063a\u0644\u0637" },
  myProgress: { en: "My progress", ur: "\u0645\u06cc\u0631\u06cc \u067e\u06cc\u0634 \u0631\u0641\u062a" },
  recentQuizzes: { en: "Recent quizzes", ur: "\u062d\u0627\u0644\u06cc\u06c1 \u06a9\u0648\u0626\u0632" },
  assignments: { en: "Assignments", ur: "\u0627\u0633\u0627\u0626\u0646\u0645\u0646\u0679\u0633" },
  booksStarted: { en: "Books started", ur: "\u0634\u0631\u0648\u0639 \u06a9\u062a\u0627\u0628\u06cc\u06ba" },
  booksCompleted: { en: "Books completed", ur: "\u0645\u06a9\u0645\u0644 \u06a9\u062a\u0627\u0628\u06cc\u06ba" },
  quizzesTaken: { en: "Quizzes taken", ur: "\u062f\u06cc\u06d2 \u06af\u0626\u06d2 \u06a9\u0648\u0626\u0632" },
  averageScore: { en: "Average score", ur: "\u0627\u0648\u0633\u0637 \u0627\u0633\u06a9\u0648\u0631" },
  students: { en: "Students", ur: "\u0637\u0644\u0628\u0627\u0621" },
  progress: { en: "Progress", ur: "\u067e\u06cc\u0634 \u0631\u0641\u062a" },
  createAssignment: { en: "New assignment", ur: "\u0646\u0626\u06cc \u0627\u0633\u0627\u0626\u0646\u0645\u0646\u0679" },
  note: { en: "Note", ur: "\u0646\u0648\u0679" },
  dueDate: { en: "Due date", ur: "\u0622\u062e\u0631\u06cc \u062a\u0627\u0631\u06cc\u062e" },
  create: { en: "Create", ur: "\u0628\u0646\u0627\u0626\u06cc\u06ba" },
  delete: { en: "Delete", ur: "\u062d\u0630\u0641" },
  users: { en: "Users", ur: "\u0635\u0627\u0631\u0641\u06cc\u0646" },
  manageUsers: { en: "Manage users", ur: "\u0635\u0627\u0631\u0641\u06cc\u0646 \u06a9\u0627 \u0627\u0646\u062a\u0638\u0627\u0645" },
  save: { en: "Save", ur: "\u0645\u062d\u0641\u0648\u0638 \u06a9\u0631\u06cc\u06ba" },
  chatTitle: { en: "Study Assistant", ur: "\u0645\u0637\u0627\u0644\u0639\u06c1 \u0645\u0639\u0627\u0648\u0646" },
  chatPlaceholder: {
    en: "Ask about any topic...",
    ur: "\u06a9\u0633\u06cc \u0628\u06be\u06cc \u0645\u0648\u0636\u0648\u0639 \u06a9\u06d2 \u0628\u0627\u0631\u06d2 \u0645\u06cc\u06ba \u067e\u0648\u0686\u06be\u06cc\u06ba...",
  },
  send: { en: "Send", ur: "\u0628\u06be\u06cc\u062c\u06cc\u06ba" },
  noBooks: { en: "No books found.", ur: "\u06a9\u0648\u0626\u06cc \u06a9\u062a\u0627\u0628 \u0646\u06c1\u06cc\u06ba \u0645\u0644\u06cc\u06d4" },
  welcome: { en: "Welcome back", ur: "\u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f" },
  demoAccounts: { en: "Demo accounts", ur: "\u0688\u06cc\u0645\u0648 \u0627\u06a9\u0627\u0624\u0646\u0679\u0633" },
  language: { en: "\u0627\u0631\u062f\u0648", ur: "English" },
  noData: { en: "Nothing here yet.", ur: "\u0627\u0628\u06be\u06cc \u06a9\u0686\u06be \u0646\u06c1\u06cc\u06ba\u06d4" },
};

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof strings) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "ekitab_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ur" ? "ur" : "en";
  });

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const dir = lang === "ur" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      dir,
      t: (key) => strings[key]?.[lang] ?? String(key),
    }),
    [lang, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

/** Pick the localized field from a bilingual object. */
export function pick(obj: object, base: string, lang: Language): string {
  const record = obj as Record<string, unknown>;
  const urKey = `${base}Ur`;
  const enKey = `${base}En`;
  if (lang === "ur") {
    const ur = record[urKey];
    if (typeof ur === "string" && ur.trim()) return ur;
  }
  return String(record[enKey] ?? "");
}

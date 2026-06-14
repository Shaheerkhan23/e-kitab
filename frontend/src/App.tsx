import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LibraryPage } from "./pages/LibraryPage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { ReaderPage } from "./pages/ReaderPage";
import { QuizPage } from "./pages/QuizPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TeacherPage } from "./pages/TeacherPage";
import { AdminPage } from "./pages/AdminPage";
import { ProfilePage } from "./pages/ProfilePage";

export function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="full-center">
        <div className="spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/books/:id/read" element={<ReaderPage />} />
        <Route path="/quizzes/:id" element={<QuizPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={["teacher", "admin"]}>
              <TeacherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

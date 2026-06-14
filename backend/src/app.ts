import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { authRouter } from "./routes/auth.js";
import { booksRouter } from "./routes/books.js";
import { readerRouter } from "./routes/reader.js";
import { quizzesRouter } from "./routes/quizzes.js";
import { studentRouter } from "./routes/student.js";
import { teacherRouter } from "./routes/teacher.js";
import { adminRouter } from "./routes/admin.js";
import { chatRouter } from "./routes/chat.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin.length > 0 ? env.corsOrigin : true,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/books", booksRouter);
  app.use("/api/reader", readerRouter);
  app.use("/api/quizzes", quizzesRouter);
  app.use("/api/student", studentRouter);
  app.use("/api/teacher", teacherRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/chat", chatRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

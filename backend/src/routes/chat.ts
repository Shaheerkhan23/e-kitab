import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import type { ChapterRow } from "../types.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "on", "and",
  "or", "for", "what", "which", "who", "how", "why", "when", "where", "do",
  "does", "did", "can", "could", "would", "should", "i", "me", "my", "you",
  "tell", "about", "explain", "define", "describe", "give", "please", "this",
  "that", "it", "with", "from", "as", "by", "be",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?\u06D4])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  bookId: z.coerce.number().int().positive().optional(),
});

chatRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { message, bookId } = chatSchema.parse(req.body);
    const normalized = message.toLowerCase();

    if (/^(hi|hello|hey|salam|assalam|aoa)\b/.test(normalized)) {
      res.json({
        reply:
          "Assalam-o-Alaikum! I'm your E-Kitab study assistant. Ask me about any topic in your books \u2014 e.g. \"explain photosynthesis\" or \"what is a noun\".",
        sources: [],
      });
      return;
    }

    if (/(help|what can you do|how to use)/.test(normalized)) {
      res.json({
        reply:
          "I can help you study! Try asking about a concept from your textbooks, request a summary, or ask for quiz tips. Open a book first to get answers focused on that book.",
        sources: [],
      });
      return;
    }

    const keywords = tokenize(message);
    const chapters = (
      bookId
        ? db
            .prepare("SELECT * FROM chapters WHERE book_id = ?")
            .all(bookId)
        : db.prepare("SELECT * FROM chapters").all()
    ) as ChapterRow[];

    let best: { sentence: string; score: number; chapter: ChapterRow } | null =
      null;
    const sources: { bookId: number; chapterId: number; title: string }[] = [];

    for (const chapter of chapters) {
      const haystack = `${chapter.title_en} ${chapter.content_en}`;
      const sentences = splitSentences(haystack);
      for (const sentence of sentences) {
        const tokens = new Set(tokenize(sentence));
        let score = 0;
        for (const keyword of keywords) {
          if (tokens.has(keyword)) score += 1;
        }
        if (score > 0 && (!best || score > best.score)) {
          best = { sentence, score, chapter };
        }
      }
    }

    if (!best) {
      res.json({
        reply:
          "I couldn't find that in the available books. Try rephrasing, or open the relevant textbook and ask again so I can search inside it.",
        sources: [],
      });
      return;
    }

    const related = splitSentences(best.chapter.content_en)
      .filter((s) => {
        const tokens = new Set(tokenize(s));
        return keywords.some((k) => tokens.has(k));
      })
      .slice(0, 3);

    const reply =
      related.length > 0
        ? `Here's what I found in "${best.chapter.title_en}":\n\n${related.join(" ")}`
        : `Here's a relevant passage from "${best.chapter.title_en}":\n\n${best.sentence}`;

    sources.push({
      bookId: best.chapter.book_id,
      chapterId: best.chapter.id,
      title: best.chapter.title_en,
    });

    res.json({ reply, sources });
  }),
);

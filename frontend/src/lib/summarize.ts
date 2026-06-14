const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "on", "and",
  "or", "for", "it", "this", "that", "with", "as", "by", "be", "can", "we",
  "they", "their", "its", "from", "at", "which", "such", "also", "these",
]);

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?\u06D4])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Lightweight extractive summary: ranks sentences by the frequency of the
 * meaningful words they contain and returns the top few in original order.
 */
export function summarize(text: string, maxSentences = 2): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) {
    return text.trim();
  }

  const freq = new Map<string, number>();
  for (const sentence of sentences) {
    for (const word of sentence.toLowerCase().match(/[a-z0-9\u0600-\u06FF]+/g) ??
      []) {
      if (word.length < 3 || STOP_WORDS.has(word)) continue;
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }

  const scored = sentences.map((sentence, index) => {
    let score = 0;
    const words =
      sentence.toLowerCase().match(/[a-z0-9\u0600-\u06FF]+/g) ?? [];
    for (const word of words) {
      score += freq.get(word) ?? 0;
    }
    return { sentence, index, score: words.length ? score / words.length : 0 };
  });

  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  return top.join(" ");
}

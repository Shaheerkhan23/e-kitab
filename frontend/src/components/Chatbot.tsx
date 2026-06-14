import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import type { ChatResponse } from "../lib/types";

interface Message {
  from: "user" | "bot";
  text: string;
}

export function Chatbot() {
  const { t, lang } = useI18n();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text:
        lang === "ur"
          ? "\u0633\u0644\u0627\u0645! \u0645\u06cc\u06ba \u0622\u067e \u06a9\u0627 \u0645\u0637\u0627\u0644\u0639\u06c1 \u0645\u0639\u0627\u0648\u0646 \u06c1\u0648\u06ba\u06d4 \u06a9\u0648\u0626\u06cc \u0633\u0648\u0627\u0644 \u067e\u0648\u0686\u06be\u06cc\u06ba\u06d4"
          : "Hi! I'm your study assistant. Ask me anything from your books.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const bookMatch = location.pathname.match(/\/books\/(\d+)/);
  const bookId = bookMatch ? Number(bookMatch[1]) : undefined;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await api<ChatResponse>("/chat", {
        method: "POST",
        body: { message: text, bookId },
      });
      setMessages((prev) => [...prev, { from: "bot", text: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
      });
    }
  };

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("chatTitle")}
      >
        {open ? "\u00d7" : "\ud83d\udcac"}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">{t("chatTitle")}</div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            {busy && <div className="chat-msg bot typing">...</div>}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatPlaceholder")}
            />
            <button className="btn-primary small" type="submit" disabled={busy}>
              {t("send")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

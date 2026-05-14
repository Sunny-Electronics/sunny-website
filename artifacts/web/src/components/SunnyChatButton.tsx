import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const TELEGRAM_URL = "https://t.me/sunny_kr_bot";

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text:
      "Hi, I am Sunny. I can help with RFQs, crystals, oscillators, documents, lead time, and Sunny Electronics information.",
  },
];

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}` || "/";
}

export default function SunnyChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: message }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          pagePath: getCurrentPath(),
          history: nextMessages.slice(-6),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.reply) {
        throw new Error(data?.message || "Sunny chat is unavailable.");
      }

      setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch {
      setError("Sunny chat API is not reachable yet. Telegram is still available.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            "I could not reach the Sunny website chat API right now. For urgent RFQ or order support, please use Telegram or the RFQ page.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl transition hover:-translate-y-0.5 hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Chat with Sunny"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Chat with Sunny
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-5 right-5 z-50 flex h-[min(620px,calc(100vh-40px))] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
      aria-label="Sunny chat"
    >
      <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <div>
          <div className="text-sm font-semibold">Sunny</div>
          <div className="text-xs opacity-85">RFQ, crystal, oscillator, and document support</div>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Close Sunny chat"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 ${
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "border border-border bg-card text-card-foreground"
            }`}
          >
            {message.text}
          </div>
        ))}
        {isSending ? (
          <div className="max-w-[85%] rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            Sunny is checking...
          </div>
        ) : null}
      </div>

      <div className="border-t border-border bg-background p-3">
        {error ? <div className="mb-2 text-xs text-destructive">{error}</div> : null}
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
            className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={input}
            maxLength={700}
            placeholder="Ask Sunny about RFQ, part number, lead time..."
            onChange={(event) => setInput(event.target.value)}
          />
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSend}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
        <a
          className="mt-2 inline-flex text-xs font-medium text-primary hover:text-primary/80"
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Telegram: sunny_kr_bot
        </a>
      </div>
    </section>
  );
}

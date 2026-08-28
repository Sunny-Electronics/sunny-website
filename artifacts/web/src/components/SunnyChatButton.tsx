import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  links?: ChatLink[];
};

type ChatLink = {
  label: string;
  href: string;
};

const TELEGRAM_URL = "https://t.me/sunny_kr_bot";
const SUNNY_MEMORY_KEY = "sunnyChatMemoryV1";
const MAX_MEMORY_ITEMS = 8;

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text:
      "Hi, Sunnychat here. I can help with Sunny catalogs, SMD crystals, oscillators, RFQs, documents, R&D, and QA support.",
  },
];

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}` || "/";
}

function readSunnyMemory() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SUNNY_MEMORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(-MAX_MEMORY_ITEMS) : [];
  } catch {
    return [];
  }
}

function writeSunnyMemory(memory: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUNNY_MEMORY_KEY, JSON.stringify(memory.slice(-MAX_MEMORY_ITEMS)));
}

function extractMemoryNote(message: string) {
  const cleaned = message.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 180);
  if (!cleaned) return "";

  const lower = cleaned.toLowerCase();
  const isUsefulContext =
    /smd|crystal|quartz|oscillator|xo|spxo|tcxo|vcxo|ocxo|resonator|frequency|mhz|khz|package|capacitance|voltage|ppm|jitter|rfq|quote|bom|lead time|qty|quantity|document|datasheet|rohs|reach|iatf|iso/.test(lower);

  return isUsefulContext ? cleaned : "";
}

export default function SunnyChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [memory, setMemory] = useState<string[]>([]);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  useEffect(() => {
    setMemory(readSunnyMemory());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => {
      const viewport = messagesViewportRef.current;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    });
  }, [input, isOpen, isSending, messages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: message }];
    const memoryNote = extractMemoryNote(message);
    const nextMemory = memoryNote
      ? [...memory.filter((item) => item.toLowerCase() !== memoryNote.toLowerCase()), memoryNote].slice(-MAX_MEMORY_ITEMS)
      : memory;

    if (memoryNote) {
      setMemory(nextMemory);
      writeSunnyMemory(nextMemory);
    }

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
          memory: nextMemory,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.reply) {
        throw new Error(data?.message || "Sunnychat is unavailable.");
      }

      const links = Array.isArray(data.links)
        ? data.links
            .map((link: Partial<ChatLink>) => ({
              label: String(link?.label || "").slice(0, 80),
              href: String(link?.href || "").slice(0, 500),
            }))
            .filter((link: ChatLink) => link.label && link.href)
        : [];

      setMessages((current) => [...current, { role: "assistant", text: data.reply, links }]);
    } catch {
      setError("Sunnychat is not reachable yet. Telegram is still available.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            "I could not reach Sunnychat right now. For urgent RFQ or order support, please use Telegram or the RFQ page.",
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
        aria-label="Chat with Sunnychat"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Sunnychat
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-5 right-5 z-50 flex h-[min(620px,calc(100vh-40px))] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
      aria-label="Sunnychat"
    >
      <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <div>
          <div className="text-sm font-semibold">Sunnychat</div>
          <div className="text-xs opacity-85">Sunny catalog, R&D, QA, RFQ support</div>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Close Sunnychat"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div ref={messagesViewportRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
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
            {message.links?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.links.map((link) => {
                  const isInternal = link.href.startsWith("/");
                  return (
                    <a
                      key={`${link.href}-${link.label}`}
                      className={`inline-flex rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                        message.role === "user"
                          ? "border-white/30 text-primary-foreground hover:bg-white/10"
                          : "border-primary/25 bg-primary/5 text-primary hover:bg-primary/10"
                      }`}
                      href={link.href}
                      target={isInternal ? undefined : "_blank"}
                      rel={isInternal ? undefined : "noopener noreferrer"}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
        {isSending ? (
          <div className="max-w-[85%] rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            Sunnychat is checking...
          </div>
        ) : null}
      </div>

      <div className="border-t border-border bg-background p-3">
        {error ? <div className="mb-2 text-xs text-destructive">{error}</div> : null}
        <form className="flex items-end gap-2" onSubmit={sendMessage}>
          <textarea
            className="min-h-[56px] min-w-0 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={input}
            maxLength={700}
            rows={2}
            placeholder="Ask Sunny about RFQ, part number, lead time..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            aria-label="Message Sunnychat. Press Enter to send or Shift plus Enter for a new line."
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

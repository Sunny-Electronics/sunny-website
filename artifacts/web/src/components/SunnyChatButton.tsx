import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  RotateCcw,
  Send,
  Upload,
  X,
} from "lucide-react";

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
const SUNNY_SESSION_KEY = "sunnyChatSessionV1";
const MAX_MEMORY_ITEMS = 8;
const MAX_SESSION_MESSAGES = 40;

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Hi, Sunnychat here. I can help with Sunny catalogs, SMD crystals, oscillators, RFQs, documents, R&D, and QA support.",
  },
];

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}` || "/";
}

function readSunnyMemory() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SUNNY_MEMORY_KEY) || "[]",
    );
    return Array.isArray(parsed)
      ? parsed
          .filter((item) => typeof item === "string")
          .slice(-MAX_MEMORY_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function writeSunnyMemory(memory: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SUNNY_MEMORY_KEY,
    JSON.stringify(memory.slice(-MAX_MEMORY_ITEMS)),
  );
}

function safeSessionLink(value: unknown): ChatLink | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ChatLink>;
  const label = String(candidate.label || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 80);
  const href = String(candidate.href || "")
    .trim()
    .slice(0, 500);
  const safeHref =
    (href.startsWith("/") && !href.startsWith("//")) || href === TELEGRAM_URL;
  return label && safeHref ? { label, href } : null;
}

function safeSessionMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Partial<ChatMessage>;
      if (candidate.role !== "assistant" && candidate.role !== "user")
        return null;
      const text = String(candidate.text || "")
        .replace(/[<>]/g, "")
        .trim()
        .slice(0, 1800);
      if (!text) return null;
      const links = Array.isArray(candidate.links)
        ? candidate.links
            .map(safeSessionLink)
            .filter((link): link is ChatLink => link !== null)
        : [];
      return { role: candidate.role, text, links };
    })
    .filter((message): message is ChatMessage => message !== null)
    .slice(-MAX_SESSION_MESSAGES);
}

function readSunnySession() {
  if (typeof window === "undefined") return initialMessages;
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SUNNY_SESSION_KEY) || "null",
    );
    const messages = safeSessionMessages(parsed?.messages);
    return messages.length ? messages : initialMessages;
  } catch {
    return initialMessages;
  }
}

function writeSunnySession(messages: ChatMessage[], memory: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SUNNY_SESSION_KEY,
    JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      messages: safeSessionMessages(messages),
      memory: memory.slice(-MAX_MEMORY_ITEMS),
    }),
  );
}

function sessionMarkdown(messages: ChatMessage[]) {
  const conversation = messages
    .map(
      (message) =>
        `## ${message.role === "assistant" ? "Sunny" : "Visitor"}\n\n${message.text}`,
    )
    .join("\n\n");
  return `# Sunnychat Session\n\nExported: ${new Date().toISOString()}\nPage: ${getCurrentPath()}\n\n${conversation}\n`;
}

function extractMemoryNote(message: string) {
  const cleaned = message
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  if (!cleaned) return "";

  const lower = cleaned.toLowerCase();
  const isUsefulContext =
    /smd|crystal|quartz|oscillator|xo|spxo|tcxo|vcxo|ocxo|resonator|frequency|mhz|khz|package|capacitance|voltage|ppm|jitter|rfq|quote|bom|lead time|qty|quantity|document|datasheet|rohs|reach|iatf|iso/.test(
      lower,
    );

  return isUsefulContext ? cleaned : "";
}

export default function SunnyChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [memory, setMemory] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending],
  );

  useEffect(() => {
    setMemory(readSunnyMemory());
    setMessages(readSunnySession());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) writeSunnySession(messages, memory);
  }, [isHydrated, memory, messages]);

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

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: message },
    ];
    const memoryNote = extractMemoryNote(message);
    const nextMemory = memoryNote
      ? [
          ...memory.filter(
            (item) => item.toLowerCase() !== memoryNote.toLowerCase(),
          ),
          memoryNote,
        ].slice(-MAX_MEMORY_ITEMS)
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

      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.reply, links },
      ]);
    } catch {
      setError("Sunnychat is not reachable yet. Telegram is still available.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not reach Sunnychat right now. For urgent RFQ or order support, please use Telegram or the RFQ page.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function copyText(text: string, marker: number | "all") {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(marker);
    window.setTimeout(() => setCopiedIndex(null), 1600);
  }

  function exportSession() {
    const payload = JSON.stringify(
      {
        format: "sunnychat-session",
        version: 1,
        exportedAt: new Date().toISOString(),
        pagePath: getCurrentPath(),
        messages: safeSessionMessages(messages),
        memory: memory.slice(-MAX_MEMORY_ITEMS),
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([payload], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sunnychat-session-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function importSession(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.format !== "sunnychat-session" || parsed?.version !== 1)
        throw new Error();
      const importedMessages = safeSessionMessages(parsed.messages);
      if (!importedMessages.length) throw new Error();
      const importedMemory = Array.isArray(parsed.memory)
        ? parsed.memory
            .map((item: unknown) => extractMemoryNote(String(item)))
            .filter(Boolean)
            .slice(-MAX_MEMORY_ITEMS)
        : [];
      setMessages(importedMessages);
      setMemory(importedMemory);
      writeSunnyMemory(importedMemory);
      setError("");
      setIsOpen(true);
    } catch {
      setError("That file is not a valid Sunnychat session export.");
    }
  }

  function resetSession() {
    setMessages(initialMessages);
    setMemory([]);
    setInput("");
    setError("");
    writeSunnyMemory([]);
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
          <div className="text-xs opacity-85">
            Sunny catalog, R&D, QA, RFQ support
          </div>
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

      <div
        ref={messagesViewportRef}
        className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`group relative max-w-[85%] rounded-lg px-3 py-2 pr-9 text-sm leading-6 ${
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "border border-border bg-card text-card-foreground"
            }`}
          >
            {message.text}
            <button
              type="button"
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded opacity-70 transition hover:bg-black/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => copyText(message.text, index)}
              aria-label={`Copy ${message.role} message`}
            >
              {copiedIndex === index ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
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
        {error ? (
          <div className="mb-2 text-xs text-destructive">{error}</div>
        ) : null}
        <div
          className="mb-2 flex flex-wrap gap-1.5"
          aria-label="Sunnychat session tools"
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted"
            onClick={() => copyText(sessionMarkdown(messages), "all")}
          >
            {copiedIndex === "all" ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copiedIndex === "all" ? "Copied" : "Copy chat"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted"
            onClick={exportSession}
          >
            <Download className="h-3 w-3" /> Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted"
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="h-3 w-3" /> Import
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted"
            onClick={resetSession}
          >
            <RotateCcw className="h-3 w-3" /> New
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importSession}
            aria-label="Import Sunnychat session"
          />
        </div>
        <form className="flex items-end gap-2" onSubmit={sendMessage}>
          <textarea
            className="min-h-[56px] min-w-0 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={input}
            maxLength={700}
            rows={2}
            placeholder="Ask Sunny about RFQ, part number, lead time..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
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

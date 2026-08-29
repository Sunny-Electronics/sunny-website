import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import qualityAwardImage from "@assets/sunny-quality-award-english.png";
import cashDividendImage from "@assets/sunny-cash-dividend-60th-english.png";

const DISMISSED_ANNOUNCEMENTS_KEY = "sunnykr-dismissed-announcements-v1";

type SunnyAnnouncement = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  href: string;
  external?: boolean;
  layout: "portrait" | "landscape";
};

// Add future public notices here with a new unique id. Visitors who dismissed
// older notices will still see a newly added announcement once.
const ANNOUNCEMENTS: SunnyAnnouncement[] = [
  {
    id: "quality-competitiveness-2022-2025-en",
    title: "Outstanding Quality Competitiveness Enterprise",
    image: qualityAwardImage,
    imageAlt:
      "Sunny Electronics selected as an Outstanding Quality Competitiveness Enterprise for four consecutive years, 2022 through 2025.",
    href: "/quality",
    layout: "portrait",
  },
  {
    id: "cash-dividend-60th-fiscal-year-en",
    title: "Cash Dividend Decision — 60th Fiscal Year",
    image: cashDividendImage,
    imageAlt:
      "Sunny Electronics notice of cash dividend decision for the 60th fiscal year.",
    href: "http://www.sunny.co.kr/html/customer01.html?mode=v&bbs_data=aWR4PTI0NzQzJnN0YXJ0UGFnZT0mbGlzdE5vPTQ3JnRhYmxlPWNzX2Jic19kYXRhJmNvZGU9bm90aWNlJnNlYXJjaF9pdGVtPSZzZWFyY2hfb3JkZXI9||&bgu=view",
    external: true,
    layout: "landscape",
  },
];

function readDismissedAnnouncements() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const value = JSON.parse(
      window.localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY) || "[]",
    );
    return new Set(
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function saveDismissedAnnouncements(ids: Set<string>) {
  try {
    window.localStorage.setItem(
      DISMISSED_ANNOUNCEMENTS_KEY,
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // The notices still close for this page view when storage is unavailable.
  }
}

export default function SunnyAnnouncements() {
  const [dismissed, setDismissed] = useState<Set<string> | null>(null);

  useEffect(() => {
    setDismissed(readDismissedAnnouncements());
  }, []);

  const visibleAnnouncements = useMemo(
    () =>
      dismissed
        ? ANNOUNCEMENTS.filter((announcement) => !dismissed.has(announcement.id))
        : [],
    [dismissed],
  );

  const dismiss = (ids: string[]) => {
    setDismissed((current) => {
      const next = new Set(current || []);
      ids.forEach((id) => next.add(id));
      saveDismissedAnnouncements(next);
      return next;
    });
  };

  useEffect(() => {
    if (!visibleAnnouncements.length) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss(visibleAnnouncements.map((announcement) => announcement.id));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visibleAnnouncements]);

  if (!dismissed || visibleAnnouncements.length === 0) return null;

  return (
    <section
      className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/60 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sunny-announcements-heading"
      data-testid="sunny-announcements"
    >
      <div className="mx-auto flex min-h-full max-w-[1240px] flex-col justify-center">
        <div className="mb-3 flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-2xl">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">
              Sunny Electronics Corp.
            </p>
            <h2
              id="sunny-announcements-heading"
              className="mt-0.5 text-base font-semibold sm:text-lg"
            >
              Company Announcements
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              dismiss(visibleAnnouncements.map((announcement) => announcement.id))
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close all announcements"
            data-testid="button-close-all-announcements"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Close all
          </button>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(320px,480px)_minmax(520px,1fr)]">
          {visibleAnnouncements.map((announcement) => (
            <article
              key={announcement.id}
              className={`overflow-hidden rounded-xl border border-white/25 bg-white shadow-2xl ${
                announcement.layout === "landscape" ? "lg:mt-10" : ""
              }`}
              data-testid={`announcement-${announcement.id}`}
            >
              <a
                href={announcement.href}
                target={announcement.external ? "_blank" : undefined}
                rel={announcement.external ? "noreferrer" : undefined}
                onClick={() => dismiss([announcement.id])}
                className="block bg-white focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-500"
                aria-label={`${announcement.title}. Open announcement.`}
              >
                <img
                  src={announcement.image}
                  alt={announcement.imageAlt}
                  className="block h-auto max-h-[68vh] w-full object-contain"
                />
              </a>
              <div className="flex min-h-12 items-center justify-between gap-3 bg-slate-800 px-3 py-2 text-white">
                <p className="text-xs leading-4 text-slate-200 sm:text-sm">
                  Click the image for details.
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {announcement.external && (
                    <ExternalLink
                      className="h-4 w-4 text-slate-300"
                      aria-label="Opens the original Sunny website in a new tab"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => dismiss([announcement.id])}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2.5 text-xs font-semibold transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                    aria-label={`Close ${announcement.title}`}
                    data-testid={`button-close-${announcement.id}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Close
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-white/80">
          Each announcement appears once on this device. New announcements will appear automatically.
        </p>
      </div>
    </section>
  );
}

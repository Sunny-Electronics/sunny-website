import type { NextFunction, Request, Response } from "express";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);
const rateLimitStore = new Map<string, RateLimitEntry>();

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function getClientIp(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function getRateLimitConfig() {
  return {
    maxRequests:
      Number.isFinite(rateLimitMax) && rateLimitMax > 0 ? rateLimitMax : 120,
    windowMs:
      Number.isFinite(rateLimitWindowMs) && rateLimitWindowMs > 0
        ? rateLimitWindowMs
        : 60_000,
  };
}

export function applySecurityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  for (const [header, value] of Object.entries(securityHeaders)) {
    res.setHeader(header, value);
  }

  next();
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const { maxRequests, windowMs } = getRateLimitConfig();
  const now = Date.now();
  const key = `${getClientIp(req)}:${req.path}`;
  const entry = rateLimitStore.get(key);

  if (rateLimitStore.size > 10_000) {
    for (const [storedKey, storedEntry] of rateLimitStore.entries()) {
      if (storedEntry.resetAt <= now) {
        rateLimitStore.delete(storedKey);
      }
    }
  }

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    next();
    return;
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many requests" });
    return;
  }

  next();
}

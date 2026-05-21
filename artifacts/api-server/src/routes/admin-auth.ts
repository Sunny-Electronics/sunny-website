import { createHmac, timingSafeEqual } from "node:crypto";
import { Router, type Request, type Response } from "express";

const router = Router();

const cookieName = "sunny_admin_session";
const sessionTtlMs = 8 * 60 * 60 * 1000;
const allowedRoles = new Set(["owner", "admin", "member"]);

type AdminRole = "owner" | "admin" | "member";

type AdminSessionPayload = {
  exp: number;
  name?: string;
  role: AdminRole;
  sub: string;
};

function getAdminConfig() {
  return {
    password: process.env.ADMIN_LOGIN_PASSWORD ?? "",
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
    username: process.env.ADMIN_LOGIN_USERNAME ?? "",
    users: getConfiguredAdminUsers(),
  };
}

function getConfiguredAdminUsers() {
  const usersJson = process.env.ADMIN_USERS_JSON;

  if (usersJson) {
    try {
      const parsed = JSON.parse(usersJson);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((user) => user && typeof user === "object")
          .map((user) => ({
            name: typeof user.name === "string" ? user.name : "",
            password: typeof user.password === "string" ? user.password : "",
            role: allowedRoles.has(user.role) ? (user.role as AdminRole) : "member",
            username: typeof user.username === "string" ? user.username.trim() : "",
          }))
          .filter((user) => user.username && user.password);
      }
    } catch {
      return [];
    }
  }

  const username = process.env.ADMIN_LOGIN_USERNAME?.trim() ?? "";
  const password = process.env.ADMIN_LOGIN_PASSWORD ?? "";

  if (!username || !password) {
    return [];
  }

  return [
    {
      name: process.env.ADMIN_LOGIN_NAME ?? "Sunny Owner",
      password,
      role: "owner" as AdminRole,
      username,
    },
  ];
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function encodeSession(payload: AdminSessionPayload, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

function verifySession(token: string | undefined, secret: string) {
  if (!token || !secret) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    if (!allowedRoles.has(payload.role) || payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function safeCompare(left: string, right: string) {
  if (typeof left !== "string" || typeof right !== "string") {
    return false;
  }

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function findAdminUser(username: string, password: string) {
  return getConfiguredAdminUsers().find(
    (user) => safeCompare(username, user.username) && safeCompare(password, user.password),
  );
}

function setSessionCookie(res: Response, token: string) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    maxAge: sessionTtlMs,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

router.post("/admin/auth/login", (req: Request, res: Response) => {
  const { secret } = getAdminConfig();

  if (!secret) {
    res.status(503).json({
      error: "Admin login is not configured",
    });
    return;
  }

  const submittedUsername =
    typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const submittedPassword =
    typeof req.body?.password === "string" ? req.body.password : "";

  const user = findAdminUser(submittedUsername, submittedPassword);

  if (!user) {
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  const payload: AdminSessionPayload = {
    exp: Date.now() + sessionTtlMs,
    name: user.name,
    role: user.role,
    sub: user.username,
  };
  const token = encodeSession(payload, secret);

  setSessionCookie(res, token);
  res.json({
    ok: true,
    user: {
      name: payload.name,
      role: payload.role,
      username: payload.sub,
    },
  });
});

router.post("/admin/auth/logout", (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/admin/auth/session", (req: Request, res: Response) => {
  const { secret } = getAdminConfig();
  const payload = verifySession(req.cookies?.[cookieName], secret);

  if (!payload) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      name: payload.name,
      role: payload.role,
      username: payload.sub,
    },
  });
});

router.get("/admin/templates", (req: Request, res: Response) => {
  const { secret } = getAdminConfig();
  const payload = verifySession(req.cookies?.[cookieName], secret);

  if (!payload) {
    res.status(401).json({ error: "Admin login required" });
    return;
  }

  res.json({
    templates: [
      {
        fileName: "SunnyKR_RFQ_Quote_Template_EN.xlsx",
        folder: "04_Documents_SPA_Private",
        id: "rfq-quote-template-en",
        label: "RFQ Quote Unit Price Log Template",
        sensitivity: "admin_only",
      },
    ],
  });
});

router.get("/admin/auth/setup-hint", (_req: Request, res: Response) => {
  res.json({
    requiredEnv: [
      "ADMIN_LOGIN_USERNAME",
      "ADMIN_LOGIN_PASSWORD",
      "ADMIN_SESSION_SECRET",
    ],
    session: "HTTP-only cookie, 8 hour expiry",
    warning:
      "Use strong unique credentials and set these only in the server environment.",
  });
});

export default router;

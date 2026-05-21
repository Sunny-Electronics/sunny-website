const { createHmac, timingSafeEqual } = require("node:crypto");

const cookieName = "sunny_admin_session";
const sessionTtlMs = 8 * 60 * 60 * 1000;
const allowedRoles = new Set(["owner", "admin", "member"]);

function getAdminConfig() {
  return {
    password: process.env.ADMIN_LOGIN_PASSWORD ?? "",
    secret: getSessionSecret(),
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
            role: allowedRoles.has(user.role) ? user.role : "member",
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
      role: "owner",
      username,
    },
  ];
}

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "";
}

function encodeSession(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

function verifySession(token, secret) {
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
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));

    if (!allowedRoles.has(payload.role) || payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function safeCompare(left, right) {
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

function findAdminUser(username, password) {
  return getConfiguredAdminUsers().find(
    (user) => safeCompare(username, user.username) && safeCompare(password, user.password),
  );
}

function parseCookie(req, name) {
  const cookieHeader = req.headers.cookie ?? "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        return separatorIndex === -1
          ? [cookie, ""]
          : [
              cookie.slice(0, separatorIndex),
              decodeURIComponent(cookie.slice(separatorIndex + 1)),
            ];
      }),
  );

  return cookies[name];
}

function shouldUseSecureCookie(req) {
  const host = req?.headers?.host ?? "";
  const forwardedProto = req?.headers?.["x-forwarded-proto"] ?? "";

  return (
    forwardedProto.includes("https") ||
    (!host.startsWith("localhost") && !host.startsWith("127.0.0.1"))
  );
}

function setSessionCookie(req, res, token) {
  const secureAttribute = shouldUseSecureCookie(req) ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(
      token,
    )}; Path=/; HttpOnly; SameSite=Strict${secureAttribute}; Max-Age=${Math.floor(
      sessionTtlMs / 1000,
    )}`,
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0`,
  );
}

function getSessionFromRequest(req) {
  return verifySession(parseCookie(req, cookieName), getSessionSecret());
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

module.exports = {
  clearSessionCookie,
  cookieName,
  encodeSession,
  findAdminUser,
  getAdminConfig,
  getConfiguredAdminUsers,
  getSessionFromRequest,
  getSessionSecret,
  parseCookie,
  readJsonBody,
  safeCompare,
  sendJson,
  sessionTtlMs,
  setSessionCookie,
  verifySession,
};

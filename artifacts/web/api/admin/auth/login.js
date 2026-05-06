import {
  encodeSession,
  getAdminConfig,
  getSessionSecret,
  readJsonBody,
  safeCompare,
  sendJson,
  setSessionCookie,
  sessionTtlMs,
} from "../../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const { password, username } = getAdminConfig();
  const secret = getSessionSecret();

  if (!password || !secret) {
    sendJson(res, 503, { error: "Admin login is not configured" });
    return;
  }

  const body = await readJsonBody(req);
  const submittedUsername =
    typeof body?.username === "string" ? body.username.trim() : "";
  const submittedPassword =
    typeof body?.password === "string" ? body.password : "";

  if (
    !safeCompare(submittedUsername, username) ||
    !safeCompare(submittedPassword, password)
  ) {
    sendJson(res, 401, { error: "Invalid admin credentials" });
    return;
  }

  const payload = {
    exp: Date.now() + sessionTtlMs,
    role: "admin",
    sub: username,
  };
  const token = encodeSession(payload, secret);

  setSessionCookie(res, token);
  sendJson(res, 200, {
    ok: true,
    user: {
      role: payload.role,
      username: payload.sub,
    },
  });
}

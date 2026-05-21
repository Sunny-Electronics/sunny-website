import {
  encodeSession,
  findAdminUser,
  getSessionSecret,
  readJsonBody,
  sendJson,
  setSessionCookie,
  sessionTtlMs,
} from "../../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const secret = getSessionSecret();

  if (!secret) {
    sendJson(res, 503, { error: "Admin login is not configured" });
    return;
  }

  const body = await readJsonBody(req);
  const submittedUsername =
    typeof body?.username === "string" ? body.username.trim() : "";
  const submittedPassword =
    typeof body?.password === "string" ? body.password : "";

  const user = findAdminUser(submittedUsername, submittedPassword);

  if (!user) {
    sendJson(res, 401, { error: "Invalid admin credentials" });
    return;
  }

  const payload = {
    exp: Date.now() + sessionTtlMs,
    name: user.name,
    role: user.role,
    sub: user.username,
  };
  const token = encodeSession(payload, secret);

  setSessionCookie(req, res, token);
  sendJson(res, 200, {
    ok: true,
    user: {
      role: payload.role,
      name: payload.name,
      username: payload.sub,
    },
  });
}

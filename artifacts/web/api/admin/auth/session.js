import { getSessionFromRequest, sendJson } from "../../_admin-auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const payload = getSessionFromRequest(req);

  if (!payload) {
    sendJson(res, 401, { authenticated: false });
    return;
  }

  sendJson(res, 200, {
    authenticated: true,
    user: {
      role: payload.role,
      username: payload.sub,
    },
  });
}

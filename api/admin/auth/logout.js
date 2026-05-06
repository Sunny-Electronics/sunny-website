const { clearSessionCookie, sendJson } = require("../../_admin-auth.js");

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
};

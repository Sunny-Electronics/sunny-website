const { getSessionFromRequest, sendJson } = require("../_admin-auth.js");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const payload = getSessionFromRequest(req);

  if (!payload) {
    sendJson(res, 401, { error: "Admin login required" });
    return;
  }

  sendJson(res, 200, {
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
};

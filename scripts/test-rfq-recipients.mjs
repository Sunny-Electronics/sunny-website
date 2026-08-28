import assert from "node:assert/strict";
import { getAssigneeEmails } from "../artifacts/web/api/quote.js";
import { getRecipientEmails as getRootRecipientEmails } from "../api/rfq/submit.js";
import { getRecipientEmails as getWebRecipientEmails } from "../artifacts/web/api/rfq/submit.js";

const originalRecipients = process.env.RFQ_ASSIGNEE_EMAILS;

try {
  process.env.RFQ_ASSIGNEE_EMAILS =
    "web@sunnykr.com, SUNNY1@SUNNY.CO.KR, john@sunny.co.kr, sunny1@sunny.co.kr";

  const expected = ["web@sunnykr.com", "john@sunny.co.kr"];
  assert.deepEqual(getAssigneeEmails(), expected);
  assert.deepEqual(getRootRecipientEmails(), expected);
  assert.deepEqual(getWebRecipientEmails(), expected);

  delete process.env.RFQ_ASSIGNEE_EMAILS;
  assert.deepEqual(getAssigneeEmails(), expected);
  assert.deepEqual(getRootRecipientEmails(), expected);
  assert.deepEqual(getWebRecipientEmails(), expected);

  process.env.RFQ_ASSIGNEE_EMAILS = "sales@example.com";
  assert.deepEqual(getAssigneeEmails(), ["sales@example.com"]);
  assert.deepEqual(getRootRecipientEmails(), ["sales@example.com"]);
  assert.deepEqual(getWebRecipientEmails(), ["sales@example.com"]);

  console.log("SunnyKR RFQ recipient tests passed.");
} finally {
  if (originalRecipients === undefined) {
    delete process.env.RFQ_ASSIGNEE_EMAILS;
  } else {
    process.env.RFQ_ASSIGNEE_EMAILS = originalRecipients;
  }
}

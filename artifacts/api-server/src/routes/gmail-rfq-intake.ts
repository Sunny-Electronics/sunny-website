import { Router, type IRouter, type Request, type Response } from "express";
import {
  processGmailRfqIntake,
  type IncomingRfqMessage,
} from "../services/email-automation/rfq-intake";

const router: IRouter = Router();

function requireAdminToken(req: Request, res: Response) {
  const configuredToken = process.env.ADMIN_API_TOKEN;

  if (!configuredToken) {
    res.status(503).json({
      error: "Admin API is not configured.",
      requiredEnv: "ADMIN_API_TOKEN",
    });
    return false;
  }

  const providedToken = req.header("x-sunny-admin-token");

  if (providedToken !== configuredToken) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}

router.post("/admin/gmail/rfq-intake", async (req, res, next) => {
  if (!requireAdminToken(req, res)) {
    return;
  }

  const validationError = validateIncomingRfqMessage(req.body);

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const result = await processGmailRfqIntake(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

function validateIncomingRfqMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return "Request body must be a Gmail message object.";
  }

  const message = value as Partial<IncomingRfqMessage>;

  if (
    !message.providerMessageId ||
    typeof message.providerMessageId !== "string"
  ) {
    return "providerMessageId is required.";
  }

  if (!message.fromEmail || typeof message.fromEmail !== "string") {
    return "fromEmail is required.";
  }

  if (message.toEmails && !Array.isArray(message.toEmails)) {
    return "toEmails must be an array when provided.";
  }

  if (message.ccEmails && !Array.isArray(message.ccEmails)) {
    return "ccEmails must be an array when provided.";
  }

  if (message.attachments && !Array.isArray(message.attachments)) {
    return "attachments must be an array when provided.";
  }

  return undefined;
}

export default router;

import { Router, type IRouter, type Request, type Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { desc } from "drizzle-orm";

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

  const providedToken = req.header("x-sunny-admin-token") ?? "";

  const configuredTokenBuffer = Buffer.from(configuredToken);
  const providedTokenBuffer = Buffer.from(providedToken);

  if (
    configuredTokenBuffer.length !== providedTokenBuffer.length ||
    !timingSafeEqual(configuredTokenBuffer, providedTokenBuffer)
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}

router.get("/admin/review-tasks", async (req, res, next) => {
  if (!requireAdminToken(req, res)) {
    return;
  }

  try {
    const { db, adminReviewTasksTable } = await import("@workspace/db");
    const tasks = await db
      .select()
      .from(adminReviewTasksTable)
      .orderBy(desc(adminReviewTasksTable.createdAt))
      .limit(100);

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/review-tasks/:id/approve", async (req, res, next) => {
  if (!requireAdminToken(req, res)) {
    return;
  }

  try {
    const { eq } = await import("drizzle-orm");
    const { db, adminReviewTasksTable } = await import("@workspace/db");
    const [task] = await db
      .update(adminReviewTasksTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(adminReviewTasksTable.id, req.params.id))
      .returning();

    if (!task) {
      res.status(404).json({ error: "Review task not found" });
      return;
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router, type IRouter } from "express";
import adminAuthRouter from "./admin-auth";
import adminReviewRouter from "./admin-review";
import gmailRfqIntakeRouter from "./gmail-rfq-intake";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(adminAuthRouter);
router.use(adminReviewRouter);
router.use(gmailRfqIntakeRouter);
router.use(healthRouter);

export default router;

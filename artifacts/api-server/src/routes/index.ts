import { Router } from "express";
import healthRouter from "./health.js";
import vehiclesRouter from "./vehicles.js";
import dealersRouter from "./dealers.js";
import inquiriesRouter from "./inquiries.js";
import adminRouter from "./admin.js";
import clientAuthRouter from "./client-auth.js";
import ordersRouter from "./orders.js";

const router: any = Router();

router.use(healthRouter);
router.use(vehiclesRouter);
router.use(dealersRouter);
router.use(inquiriesRouter);
router.use(adminRouter);
router.use(clientAuthRouter);
router.use(ordersRouter);

export default router;

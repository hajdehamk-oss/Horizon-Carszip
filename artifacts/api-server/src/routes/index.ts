import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vehiclesRouter from "./vehicles";
import dealersRouter from "./dealers";
import inquiriesRouter from "./inquiries";
import adminRouter from "./admin";
import clientAuthRouter from "./client-auth";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vehiclesRouter);
router.use(dealersRouter);
router.use(inquiriesRouter);
router.use(adminRouter);
router.use(clientAuthRouter);
router.use(ordersRouter);

export default router;

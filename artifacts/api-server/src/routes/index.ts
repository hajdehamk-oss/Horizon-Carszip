import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vehiclesRouter from "./vehicles";
import usersRouter from "./users";
import dealersRouter from "./dealers";
import favoritesRouter from "./favorites";
import inquiriesRouter from "./inquiries";
import statsRouter from "./stats";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vehiclesRouter);
router.use(usersRouter);
router.use(dealersRouter);
router.use(favoritesRouter);
router.use(inquiriesRouter);
router.use(statsRouter);
router.use(adminRouter);
router.use(uploadRouter);

export default router;

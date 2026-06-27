import { Router } from "express";
import type { Request } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: import("express").Router = Router();

router.get("/healthz", (_req: Request, res: any) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;

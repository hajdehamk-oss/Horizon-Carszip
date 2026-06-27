import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/debug", async (_req, res) => {
  const info: Record<string, unknown> = {
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    dbUrlPrefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.slice(0, 30) + "..."
      : null,
  };

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    info.dbConnection = "ok";
  } catch (err: unknown) {
    info.dbConnection = "error";
    info.dbError =
      err instanceof Error ? err.message : String(err);
  }

  res.json(info);
});

export default router;

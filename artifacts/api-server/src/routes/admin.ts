import { Router } from "express";
import { db } from "@workspace/db";
import { vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"];
if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD environment variable is not set");
}
const ADMIN_TOKEN = Buffer.from(`horizone:${ADMIN_PASSWORD}`).toString("base64");

export function verifyAdminToken(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return false;
  const token = auth.replace(/^Bearer\s+/, "");
  return token === ADMIN_TOKEN;
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Ungültiges Passwort" });
  }
  res.json({ token: ADMIN_TOKEN });
});

router.delete("/vehicles/:id/admin", async (req, res) => {
  if (!verifyAdminToken(req as Parameters<typeof verifyAdminToken>[0])) {
    return res.status(401).json({ error: "Nicht autorisiert" });
  }
  try {
    const id = parseInt(req.params.id);
    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteVehicle error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;

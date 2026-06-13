import { Router } from "express";
import { db } from "@workspace/db";
import { vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getAdminPassword(): string | null {
  return process.env["ADMIN_PASSWORD"] ?? null;
}

function getAdminToken(): string | null {
  const pw = getAdminPassword();
  if (!pw) return null;
  return Buffer.from(`horizone:${pw}`).toString("base64");
}

export function verifyAdminToken(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const expectedToken = getAdminToken();
  if (!expectedToken) return false;
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return false;
  const token = auth.replace(/^Bearer\s+/, "");
  return token === expectedToken;
}

router.post("/admin/login", (req, res) => {
  const pw = getAdminPassword();
  if (!pw) {
    return res.status(503).json({ error: "Admin-Login nicht konfiguriert" });
  }
  const { password } = req.body as { password?: string };
  if (!password || password !== pw) {
    return res.status(401).json({ error: "Ungültiges Passwort" });
  }
  res.json({ token: getAdminToken() });
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

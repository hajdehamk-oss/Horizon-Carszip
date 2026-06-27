import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signClientToken, requireClientAuth } from "../middlewares/client-auth.js";

const router: import("express").Router = Router();

router.post("/auth/register", async (req, res) => {
  const { name, email, password, phone, city } = req.body;
  if (!name || !email || !password || !phone) {
    res.status(400).json({ error: "Name, E-Mail, Passwort und Telefonnummer sind erforderlich" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "E-Mail bereits registriert" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, phone, city }).returning();
  const token = signClientToken({ userId: user.id, email: user.email, name: user.name });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "E-Mail und Passwort sind erforderlich" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Ungültige E-Mail oder Passwort" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Ungültige E-Mail oder Passwort" });
    return;
  }
  const token = signClientToken({ userId: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get("/auth/me", requireClientAuth, async (req, res) => {
  const { userId } = (req as any).clientUser;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Benutzer nicht gefunden" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, phone: user.phone });
});

export default router;

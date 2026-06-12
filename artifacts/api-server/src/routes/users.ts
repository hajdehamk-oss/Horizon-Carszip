import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/users", async (req, res) => {
  try {
    const user = await db.insert(usersTable).values(req.body).returning();
    res.status(201).json(user[0]);
  } catch (err) {
    req.log.error({ err }, "createUser error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user[0]) return res.status(404).json({ error: "Benutzer nicht gefunden" });
    res.json(user[0]);
  } catch (err) {
    req.log.error({ err }, "getUser error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await db.update(usersTable).set(req.body).where(eq(usersTable.id, id)).returning();
    if (!user[0]) return res.status(404).json({ error: "Benutzer nicht gefunden" });
    res.json(user[0]);
  } catch (err) {
    req.log.error({ err }, "updateUser error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/users/:id/vehicles", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicles = await db.select().from(vehiclesTable).where(eq(vehiclesTable.userId, id));
    res.json(vehicles);
  } catch (err) {
    req.log.error({ err }, "getUserVehicles error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;

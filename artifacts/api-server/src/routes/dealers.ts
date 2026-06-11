import { Router } from "express";
import { db } from "@workspace/db";
import { dealersTable, vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/dealers", async (req, res) => {
  try {
    const dealers = await db.select().from(dealersTable);
    res.json(dealers);
  } catch (err) {
    req.log.error({ err }, "listDealers error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.post("/dealers", async (req, res) => {
  try {
    const dealer = await db.insert(dealersTable).values(req.body).returning();
    res.status(201).json(dealer[0]);
  } catch (err) {
    req.log.error({ err }, "createDealer error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/dealers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dealer = await db.select().from(dealersTable).where(eq(dealersTable.id, id)).limit(1);
    if (!dealer[0]) return res.status(404).json({ error: "Händler nicht gefunden" });
    res.json(dealer[0]);
  } catch (err) {
    req.log.error({ err }, "getDealer error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.patch("/dealers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dealer = await db.update(dealersTable).set(req.body).where(eq(dealersTable.id, id)).returning();
    if (!dealer[0]) return res.status(404).json({ error: "Händler nicht gefunden" });
    res.json(dealer[0]);
  } catch (err) {
    req.log.error({ err }, "updateDealer error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/dealers/:id/vehicles", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicles = await db.select().from(vehiclesTable).where(eq(vehiclesTable.dealerId, id));
    res.json(vehicles);
  } catch (err) {
    req.log.error({ err }, "getDealerVehicles error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;

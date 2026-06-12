import { Router } from "express";
import { db } from "@workspace/db";
import { inquiriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/inquiries", async (req, res) => {
  try {
    const { userId, vehicleId, dealerId } = req.query as Record<string, string>;
    const conditions = [];
    if (userId) conditions.push(eq(inquiriesTable.userId, parseInt(userId)));
    if (vehicleId) conditions.push(eq(inquiriesTable.vehicleId, parseInt(vehicleId)));
    if (dealerId) conditions.push(eq(inquiriesTable.dealerId, parseInt(dealerId)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const inquiries = await db.select().from(inquiriesTable).where(where);
    res.json(inquiries);
  } catch (err) {
    req.log.error({ err }, "listInquiries error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const inquiry = await db.insert(inquiriesTable).values(req.body).returning();
    res.status(201).json(inquiry[0]);
  } catch (err) {
    req.log.error({ err }, "createInquiry error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.patch("/inquiries/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const inquiry = await db.update(inquiriesTable).set(req.body).where(eq(inquiriesTable.id, id)).returning();
    if (!inquiry[0]) return res.status(404).json({ error: "Anfrage nicht gefunden" });
    res.json(inquiry[0]);
  } catch (err) {
    req.log.error({ err }, "updateInquiry error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;

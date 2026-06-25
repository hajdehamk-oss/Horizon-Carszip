import { Router } from "express";
import { db, inquiriesTable, vehiclesTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { ListInquiriesQueryParams, CreateInquiryBody, UpdateInquiryParams, UpdateInquiryBody } from "@workspace/api-zod";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

function toInquiryDTO(i: any, vehicle?: any) {
  return {
    id: i.id,
    vehicleId: i.vehicleId,
    vehicleTitle: vehicle?.title ?? null,
    senderName: i.senderName,
    senderEmail: i.senderEmail,
    senderPhone: i.senderPhone ?? null,
    name: i.senderName,
    email: i.senderEmail,
    phone: i.senderPhone ?? null,
    message: i.message,
    status: i.status,
    dealerId: i.dealerId ?? null,
    createdAt: i.createdAt ? i.createdAt.toISOString() : new Date().toISOString(),
  };
}

router.get("/inquiries", requireAdminAuth, async (req, res) => {
  try {
    const parsed = ListInquiriesQueryParams.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query" });

    let query = db.select().from(inquiriesTable).$dynamic();
    if (parsed.data.dealerId) {
      query = query.where(eq(inquiriesTable.dealerId, parsed.data.dealerId));
    }
    const inquiries = await query.orderBy(desc(inquiriesTable.createdAt));

    const vehicleIds = [...new Set(inquiries.map(i => i.vehicleId))];
    const vehicles = vehicleIds.length > 0
      ? await db.select({ id: vehiclesTable.id, title: vehiclesTable.title }).from(vehiclesTable).where(inArray(vehiclesTable.id, vehicleIds))
      : [];
    const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));

    return res.json(inquiries.map(i => toInquiryDTO(i, vehicleMap[i.vehicleId])));
  } catch (err) {
    req.log.error({ err }, "listInquiries error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const parsed = CreateInquiryBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

    const { vehicleId, senderName, senderEmail, senderPhone, message } = parsed.data;
    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, vehicleId));
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const [inquiry] = await db.insert(inquiriesTable).values({
      vehicleId,
      senderName,
      senderEmail,
      senderPhone,
      message,
      dealerId: vehicle.dealerId ?? undefined,
      status: "neu",
    }).returning();

    return res.status(201).json(toInquiryDTO(inquiry, vehicle));
  } catch (err) {
    req.log.error({ err }, "createInquiry error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/inquiries/:id", requireAdminAuth, async (req, res) => {
  try {
    const paramsParsed = UpdateInquiryParams.safeParse({ id: parseInt(String(req.params.id), 10) });
    if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

    const bodyParsed = UpdateInquiryBody.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json({ error: "Invalid body" });

    const [inquiry] = await db.update(inquiriesTable)
      .set({ status: bodyParsed.data.status })
      .where(eq(inquiriesTable.id, paramsParsed.data.id))
      .returning();

    if (!inquiry) return res.status(404).json({ error: "Not found" });

    const [vehicle] = await db.select({ id: vehiclesTable.id, title: vehiclesTable.title })
      .from(vehiclesTable).where(eq(vehiclesTable.id, inquiry.vehicleId));

    return res.json(toInquiryDTO(inquiry, vehicle));
  } catch (err) {
    req.log.error({ err }, "updateInquiry error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

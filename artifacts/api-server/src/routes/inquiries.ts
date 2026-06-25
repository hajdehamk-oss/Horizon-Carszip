import { Router } from "express";
import { db, inquiriesTable, vehiclesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListInquiriesQueryParams, CreateInquiryBody, UpdateInquiryParams, UpdateInquiryBody } from "@workspace/api-zod";

const router = Router();

function toInquiryDTO(i: any, vehicle?: any) {
  return {
    id: i.id,
    vehicleId: i.vehicleId,
    vehicleTitle: vehicle?.title ?? null,
    name: i.name,
    email: i.email,
    phone: i.phone ?? null,
    message: i.message,
    status: i.status,
    dealerId: i.dealerId ?? null,
    createdAt: i.createdAt ? i.createdAt.toISOString() : new Date().toISOString(),
  };
}

router.get("/inquiries", async (req, res) => {
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
      ? await db.select({ id: vehiclesTable.id, title: vehiclesTable.title }).from(vehiclesTable).where(eq(vehiclesTable.id, vehicleIds[0]))
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
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      message,
      dealerId: vehicle.dealerId,
      status: "pending",
    }).returning();

    return res.status(201).json(toInquiryDTO(inquiry, vehicle));
  } catch (err) {
    req.log.error({ err }, "createInquiry error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/inquiries/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateInquiryParams.safeParse({ id: parseInt(req.params.id, 10) });
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

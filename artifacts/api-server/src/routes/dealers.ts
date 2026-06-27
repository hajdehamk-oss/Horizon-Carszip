import { Router } from "express";
import { db, dealersTable, vehiclesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetDealerParams, GetDealerVehiclesParams } from "@workspace/api-zod";

const router: import("express").Router = Router();

function toDealerDTO(d: any) {
  return {
    id: d.id,
    name: d.name,
    location: d.city ?? null,
    city: d.city ?? null,
    address: d.address ?? null,
    phone: d.phone ?? null,
    email: d.email ?? null,
    description: d.description ?? null,
    rating: d.rating ? Number(d.rating) : null,
    verified: d.verified,
    reviewCount: d.reviewCount ?? 0,
  };
}

function toVehicleDTO(v: any, dealer?: any) {
  return {
    id: v.id,
    title: v.title,
    brand: v.brand,
    model: v.model,
    year: v.year,
    price: Number(v.price),
    km: v.km,
    fuelType: v.fuelType,
    transmission: v.transmission ?? null,
    power: v.power ?? null,
    color: v.color ?? null,
    description: v.description ?? null,
    images: v.images ?? [],
    featured: v.featured,
    dealerId: v.dealerId ?? null,
    dealerName: dealer?.name ?? null,
    location: v.location ?? null,
    createdAt: v.createdAt ? v.createdAt.toISOString() : null,
  };
}

router.get("/dealers", async (req, res) => {
  try {
    const dealers = await db.select().from(dealersTable).orderBy(dealersTable.name);
    return res.json(dealers.map(toDealerDTO));
  } catch (err) {
    req.log.error({ err }, "listDealers error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dealers/:id", async (req, res) => {
  try {
    const parsed = GetDealerParams.safeParse({ id: parseInt(String(req.params.id), 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [dealer] = await db.select().from(dealersTable).where(eq(dealersTable.id, parsed.data.id));
    if (!dealer) return res.status(404).json({ error: "Not found" });
    return res.json(toDealerDTO(dealer));
  } catch (err) {
    req.log.error({ err }, "getDealer error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dealers/:id/vehicles", async (req, res) => {
  try {
    const parsed = GetDealerVehiclesParams.safeParse({ id: parseInt(String(req.params.id), 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const vehicles = await db.select().from(vehiclesTable)
      .where(eq(vehiclesTable.dealerId, parsed.data.id))
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(50);
    const [dealer] = await db.select().from(dealersTable).where(eq(dealersTable.id, parsed.data.id));
    return res.json(vehicles.map(v => toVehicleDTO(v, dealer)));
  } catch (err) {
    req.log.error({ err }, "getDealerVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

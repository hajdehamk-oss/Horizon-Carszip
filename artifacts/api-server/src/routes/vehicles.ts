import { Router } from "express";
import { db, vehiclesTable, dealersTable } from "@workspace/db";
import { eq, desc, and, gte, lte, ilike, inArray, sql } from "drizzle-orm";
import {
  ListVehiclesQueryParams,
  CreateVehicleBody,
  GetVehicleParams,
  DeleteVehicleParams,
  GetSimilarVehiclesParams,
} from "@workspace/api-zod";

const router = Router();

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
    dealerId: v.dealerId,
    dealerName: dealer?.name ?? null,
    location: v.location ?? null,
    createdAt: v.createdAt ? v.createdAt.toISOString() : null,
  };
}

async function fetchDealersForVehicles(vehicles: any[]) {
  const dealerIds = [...new Set(vehicles.map(v => v.dealerId))];
  if (dealerIds.length === 0) return {};
  const dealers = await db.select().from(dealersTable).where(inArray(dealersTable.id, dealerIds));
  return Object.fromEntries(dealers.map(d => [d.id, d]));
}

router.get("/vehicles", async (req, res) => {
  try {
    const parsed = ListVehiclesQueryParams.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    const { brand, minPrice, maxPrice, minYear, maxYear, maxKm, fuelType, dealerId, limit = 20, offset = 0 } = parsed.data;

    const conditions = [];
    if (brand) conditions.push(ilike(vehiclesTable.brand, `%${brand}%`));
    if (minPrice) conditions.push(gte(vehiclesTable.price, String(minPrice)));
    if (maxPrice) conditions.push(lte(vehiclesTable.price, String(maxPrice)));
    if (minYear) conditions.push(gte(vehiclesTable.year, minYear));
    if (maxYear) conditions.push(lte(vehiclesTable.year, maxYear));
    if (maxKm) conditions.push(lte(vehiclesTable.km, maxKm));
    if (fuelType) conditions.push(eq(vehiclesTable.fuelType, fuelType));
    if (dealerId) conditions.push(eq(vehiclesTable.dealerId, dealerId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [vehicles, countResult] = await Promise.all([
      db.select().from(vehiclesTable).where(where).orderBy(desc(vehiclesTable.createdAt)).limit(limit ?? 20).offset(offset ?? 0),
      db.select({ count: sql<number>`count(*)` }).from(vehiclesTable).where(where),
    ]);

    const dealerMap = await fetchDealersForVehicles(vehicles);

    return res.json({
      vehicles: vehicles.map(v => toVehicleDTO(v, dealerMap[v.dealerId])),
      total: Number(countResult[0]?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "listVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/vehicles", async (req, res) => {
  try {
    const parsed = CreateVehicleBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body" });
    }
    const data = parsed.data;
    const [vehicle] = await db.insert(vehiclesTable).values({
      title: data.title,
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: String(data.price),
      km: data.km,
      fuelType: data.fuelType,
      transmission: data.transmission,
      power: data.power,
      color: data.color,
      description: data.description,
      images: data.images,
      featured: data.featured ?? false,
      dealerId: data.dealerId,
      location: data.location,
    }).returning();
    return res.status(201).json(toVehicleDTO(vehicle));
  } catch (err) {
    req.log.error({ err }, "createVehicle error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/featured", async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? "6"), 10);
    const vehicles = await db.select().from(vehiclesTable)
      .where(eq(vehiclesTable.featured, true))
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(limit);
    const dealerMap = await fetchDealersForVehicles(vehicles);
    return res.json(vehicles.map(v => toVehicleDTO(v, dealerMap[v.dealerId])));
  } catch (err) {
    req.log.error({ err }, "getFeaturedVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/recent", async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? "6"), 10);
    const vehicles = await db.select().from(vehiclesTable)
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(limit);
    const dealerMap = await fetchDealersForVehicles(vehicles);
    return res.json(vehicles.map(v => toVehicleDTO(v, dealerMap[v.dealerId])));
  } catch (err) {
    req.log.error({ err }, "getRecentVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/:id", async (req, res) => {
  try {
    const parsed = GetVehicleParams.safeParse({ id: parseInt(req.params.id, 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.id));
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    const [dealer] = await db.select().from(dealersTable).where(eq(dealersTable.id, vehicle.dealerId));
    return res.json(toVehicleDTO(vehicle, dealer));
  } catch (err) {
    req.log.error({ err }, "getVehicle error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/vehicles/:id", async (req, res) => {
  try {
    const parsed = DeleteVehicleParams.safeParse({ id: parseInt(req.params.id, 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteVehicle error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/:id/similar", async (req, res) => {
  try {
    const parsed = GetSimilarVehiclesParams.safeParse({ id: parseInt(req.params.id, 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [source] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.id));
    if (!source) return res.status(404).json({ error: "Not found" });
    const similar = await db.select().from(vehiclesTable)
      .where(and(eq(vehiclesTable.brand, source.brand), sql`id != ${source.id}`))
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(4);
    const dealerMap = await fetchDealersForVehicles(similar);
    return res.json(similar.map(v => toVehicleDTO(v, dealerMap[v.dealerId])));
  } catch (err) {
    req.log.error({ err }, "getSimilarVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

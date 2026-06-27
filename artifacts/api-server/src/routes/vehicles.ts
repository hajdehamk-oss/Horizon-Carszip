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
import { requireAdminAuth } from "../middlewares/auth.js";

const router: any = Router();

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
    vehicleType: v.vehicleType ?? null,
    power: v.power ?? null,
    color: v.color ?? null,
    condition: v.condition ?? null,
    doors: v.doors ?? null,
    seats: v.seats ?? null,
    description: v.description ?? null,
    images: Array.isArray(v.images) ? v.images : [],
    featured: v.featured,
    dealerId: v.dealerId ?? null,
    dealerName: dealer?.name ?? null,
    location: v.location ?? null,
    createdAt: v.createdAt ? v.createdAt.toISOString() : null,
  };
}

async function fetchDealersForVehicles(vehicles: any[]) {
  const dealerIds = [...new Set(vehicles.map(v => v.dealerId).filter((id): id is number => id != null))];
  if (dealerIds.length === 0) return {} as Record<number, any>;
  const dealers = await db.select().from(dealersTable).where(inArray(dealersTable.id, dealerIds));
  return Object.fromEntries(dealers.map(d => [d.id, d])) as Record<number, any>;
}

router.get("/vehicles", async (req: any, res: any) => {
  try {
    const parsed = ListVehiclesQueryParams.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    const { brand, minPrice, maxPrice, minYear, maxYear, maxKm, fuelType, dealerId, limit = 20, offset = 0, q, sortBy, sortOrder } = parsed.data;

    const conditions = [];
    if (q) conditions.push(sql`(${vehiclesTable.title} ilike ${'%' + q + '%'} OR ${vehiclesTable.brand} ilike ${'%' + q + '%'} OR ${vehiclesTable.model} ilike ${'%' + q + '%'})`);
    if (brand) conditions.push(ilike(vehiclesTable.brand, `%${brand}%`));
    if (minPrice != null) conditions.push(gte(vehiclesTable.price, minPrice));
    if (maxPrice != null) conditions.push(lte(vehiclesTable.price, maxPrice));
    if (minYear != null) conditions.push(gte(vehiclesTable.year, minYear));
    if (maxYear != null) conditions.push(lte(vehiclesTable.year, maxYear));
    if (maxKm != null) conditions.push(lte(vehiclesTable.km, maxKm));
    if (fuelType) conditions.push(eq(vehiclesTable.fuelType, fuelType));
    if (dealerId != null) conditions.push(eq(vehiclesTable.dealerId, dealerId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortCol = sortBy === "price" ? vehiclesTable.price
      : sortBy === "km" ? vehiclesTable.km
      : sortBy === "year" ? vehiclesTable.year
      : vehiclesTable.createdAt;
    const order = sortOrder === "asc" ? sortCol : desc(sortCol);

    const [vehicles, countResult] = await Promise.all([
      db.select().from(vehiclesTable).where(where).orderBy(order).limit(limit ?? 20).offset(offset ?? 0),
      db.select({ count: sql<number>`count(*)` }).from(vehiclesTable).where(where),
    ]);

    const dealerMap = await fetchDealersForVehicles(vehicles);

    return res.json({
      vehicles: vehicles.map(v => toVehicleDTO(v, v.dealerId != null ? dealerMap[v.dealerId] : undefined)),
      total: Number(countResult[0]?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "listVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/vehicles", requireAdminAuth, async (req: any, res: any) => {
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
      price: Math.round(data.price),
      km: data.km,
      fuelType: data.fuelType,
      transmission: data.transmission ?? "Automatik",
      vehicleType: "Sonstige",
      location: data.location ?? "Schweiz",
      power: data.power ?? undefined,
      color: data.color ?? undefined,
      description: data.description ?? undefined,
      images: (data.images ?? []) as string[],
      featured: data.featured ?? false,
      dealerId: data.dealerId ?? undefined,
    }).returning();
    return res.status(201).json(toVehicleDTO(vehicle));
  } catch (err) {
    req.log.error({ err }, "createVehicle error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/featured", async (req: any, res: any) => {
  try {
    const limit = parseInt(String(req.query.limit ?? "6"), 10);
    const vehicles = await db.select().from(vehiclesTable)
      .where(eq(vehiclesTable.featured, true))
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(limit);
    const dealerMap = await fetchDealersForVehicles(vehicles);
    return res.json(vehicles.map(v => toVehicleDTO(v, v.dealerId != null ? dealerMap[v.dealerId] : undefined)));
  } catch (err) {
    req.log.error({ err }, "getFeaturedVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/recent", async (req: any, res: any) => {
  try {
    const limit = parseInt(String(req.query.limit ?? "6"), 10);
    const vehicles = await db.select().from(vehiclesTable)
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(limit);
    const dealerMap = await fetchDealersForVehicles(vehicles);
    return res.json(vehicles.map(v => toVehicleDTO(v, v.dealerId != null ? dealerMap[v.dealerId] : undefined)));
  } catch (err) {
    req.log.error({ err }, "getRecentVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/:id", async (req: any, res: any) => {
  try {
    const parsed = GetVehicleParams.safeParse({ id: parseInt(String(req.params.id), 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.id));
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    const dealer = vehicle.dealerId
      ? (await db.select().from(dealersTable).where(eq(dealersTable.id, vehicle.dealerId)))[0]
      : undefined;
    return res.json(toVehicleDTO(vehicle, dealer));
  } catch (err) {
    req.log.error({ err }, "getVehicle error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/vehicles/:id", requireAdminAuth, async (req: any, res: any) => {
  try {
    const parsed = DeleteVehicleParams.safeParse({ id: parseInt(String(req.params.id), 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteVehicle error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vehicles/:id/similar", async (req: any, res: any) => {
  try {
    const parsed = GetSimilarVehiclesParams.safeParse({ id: parseInt(String(req.params.id), 10) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [source] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.id));
    if (!source) return res.status(404).json({ error: "Not found" });
    const similar = await db.select().from(vehiclesTable)
      .where(and(eq(vehiclesTable.brand, source.brand), sql`id != ${source.id}`))
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(4);
    const dealerMap = await fetchDealersForVehicles(similar);
    return res.json(similar.map(v => toVehicleDTO(v, v.dealerId != null ? dealerMap[v.dealerId] : undefined)));
  } catch (err) {
    req.log.error({ err }, "getSimilarVehicles error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

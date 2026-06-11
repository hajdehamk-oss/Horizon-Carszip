import { Router } from "express";
import { db } from "@workspace/db";
import { vehiclesTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc, asc, sql } from "drizzle-orm";

const router = Router();

router.get("/vehicles", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "20",
      brand,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      minKm,
      maxKm,
      fuelType,
      transmission,
      vehicleType,
      location,
      sortBy = "createdAt",
      sortOrder = "desc",
      featured,
      q,
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (brand) conditions.push(ilike(vehiclesTable.brand, `%${brand}%`));
    if (model) conditions.push(ilike(vehiclesTable.model, `%${model}%`));
    if (minYear) conditions.push(gte(vehiclesTable.year, parseInt(minYear)));
    if (maxYear) conditions.push(lte(vehiclesTable.year, parseInt(maxYear)));
    if (minPrice) conditions.push(gte(vehiclesTable.price, parseInt(minPrice)));
    if (maxPrice) conditions.push(lte(vehiclesTable.price, parseInt(maxPrice)));
    if (minKm) conditions.push(gte(vehiclesTable.km, parseInt(minKm)));
    if (maxKm) conditions.push(lte(vehiclesTable.km, parseInt(maxKm)));
    if (fuelType) conditions.push(eq(vehiclesTable.fuelType, fuelType));
    if (transmission) conditions.push(eq(vehiclesTable.transmission, transmission));
    if (vehicleType) conditions.push(eq(vehiclesTable.vehicleType, vehicleType));
    if (location) conditions.push(ilike(vehiclesTable.location, `%${location}%`));
    if (featured === "true") conditions.push(eq(vehiclesTable.featured, true));
    if (q) {
      conditions.push(
        sql`(${ilike(vehiclesTable.title, `%${q}%`)} OR ${ilike(vehiclesTable.brand, `%${q}%`)} OR ${ilike(vehiclesTable.model, `%${q}%`)})`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const allowedSortFields: Record<string, typeof vehiclesTable.price | typeof vehiclesTable.createdAt | typeof vehiclesTable.km | typeof vehiclesTable.year> = {
      price: vehiclesTable.price,
      createdAt: vehiclesTable.createdAt,
      km: vehiclesTable.km,
      year: vehiclesTable.year,
    };

    const sortField = allowedSortFields[sortBy] ?? vehiclesTable.createdAt;
    const orderFn = sortOrder === "asc" ? asc : desc;

    const [vehicles, totalResult] = await Promise.all([
      db.select().from(vehiclesTable).where(where).orderBy(orderFn(sortField)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable).where(where),
    ]);

    res.json({
      vehicles,
      total: totalResult[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "listVehicles error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/vehicles/featured", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) ?? "8");
    const vehicles = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.featured, true))
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(limit);
    res.json(vehicles);
  } catch (err) {
    req.log.error({ err }, "getFeaturedVehicles error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/vehicles/recent", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) ?? "8");
    const vehicles = await db
      .select()
      .from(vehiclesTable)
      .orderBy(desc(vehiclesTable.createdAt))
      .limit(limit);
    res.json(vehicles);
  } catch (err) {
    req.log.error({ err }, "getRecentVehicles error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/vehicles/brands", async (req, res) => {
  try {
    const results = await db
      .select({
        brand: vehiclesTable.brand,
        count: sql<number>`count(*)::int`,
      })
      .from(vehiclesTable)
      .groupBy(vehiclesTable.brand)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const brandLogos: Record<string, string> = {
      BMW: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/600px-BMW.svg.png",
      "Mercedes-Benz": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/600px-Mercedes-Logo.svg.png",
      Audi: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/600px-Audi-Logo_2016.svg.png",
      Volkswagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/600px-Volkswagen_logo_2019.svg.png",
      Porsche: "https://upload.wikimedia.org/wikipedia/de/thumb/5/5e/Porsche_Logo.svg/600px-Porsche_Logo.svg.png",
      Opel: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Opel_2017.svg/600px-Opel_2017.svg.png",
      Tesla: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/600px-Tesla_T_symbol.svg.png",
      Ford: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/600px-Ford_logo_flat.svg.png",
      Toyota: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/600px-Toyota_carlogo.svg.png",
      Hyundai: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hyundai_Motor_Company_logo.svg/600px-Hyundai_Motor_Company_logo.svg.png",
    };

    res.json(results.map(r => ({
      brand: r.brand,
      count: r.count,
      logoUrl: brandLogos[r.brand] ?? "",
    })));
  } catch (err) {
    req.log.error({ err }, "getPopularBrands error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/vehicles/categories", async (req, res) => {
  try {
    const results = await db
      .select({
        category: vehiclesTable.vehicleType,
        count: sql<number>`count(*)::int`,
      })
      .from(vehiclesTable)
      .groupBy(vehiclesTable.vehicleType)
      .orderBy(desc(sql`count(*)`));

    const icons: Record<string, string> = {
      PKW: "car",
      SUV: "truck",
      Kombi: "car",
      Cabrio: "wind",
      Coupe: "zap",
      Van: "users",
      LKW: "package",
      Motorrad: "bike",
    };

    res.json(results.map(r => ({
      category: r.category,
      count: r.count,
      icon: icons[r.category] ?? "car",
    })));
  } catch (err) {
    req.log.error({ err }, "getVehicleCategories error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/vehicles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicle = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, id)).limit(1);
    if (!vehicle[0]) return res.status(404).json({ error: "Fahrzeug nicht gefunden" });

    await db.update(vehiclesTable).set({ views: (vehicle[0].views ?? 0) + 1 }).where(eq(vehiclesTable.id, id));

    res.json(vehicle[0]);
  } catch (err) {
    req.log.error({ err }, "getVehicle error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/vehicles/:id/similar", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicle = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, id)).limit(1);
    if (!vehicle[0]) return res.status(404).json({ error: "Fahrzeug nicht gefunden" });

    const similar = await db
      .select()
      .from(vehiclesTable)
      .where(
        and(
          eq(vehiclesTable.brand, vehicle[0].brand),
          sql`${vehiclesTable.id} != ${id}`,
          lte(vehiclesTable.price, vehicle[0].price * 1.3),
          gte(vehiclesTable.price, vehicle[0].price * 0.7)
        )
      )
      .limit(4);

    if (similar.length < 4) {
      const extra = await db
        .select()
        .from(vehiclesTable)
        .where(
          and(
            sql`${vehiclesTable.id} != ${id}`,
            eq(vehiclesTable.vehicleType, vehicle[0].vehicleType)
          )
        )
        .limit(4 - similar.length);
      similar.push(...extra);
    }

    res.json(similar.slice(0, 4));
  } catch (err) {
    req.log.error({ err }, "getSimilarVehicles error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.post("/vehicles", async (req, res) => {
  try {
    const vehicle = await db.insert(vehiclesTable).values(req.body).returning();
    res.status(201).json(vehicle[0]);
  } catch (err) {
    req.log.error({ err }, "createVehicle error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.patch("/vehicles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicle = await db.update(vehiclesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(vehiclesTable.id, id)).returning();
    if (!vehicle[0]) return res.status(404).json({ error: "Fahrzeug nicht gefunden" });
    res.json(vehicle[0]);
  } catch (err) {
    req.log.error({ err }, "updateVehicle error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.delete("/vehicles/:id", async (req, res) => {
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

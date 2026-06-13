import { Router } from "express";
import { db } from "@workspace/db";
import { favoritesTable, vehiclesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/favorites", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId) return res.status(400).json({ error: "userId erforderlich" });

    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
    const vehicleIds = favs.map(f => f.vehicleId);

    if (vehicleIds.length === 0) return res.json([]);

    const vehicles = await Promise.all(
      vehicleIds.map(id => db.select().from(vehiclesTable).where(eq(vehiclesTable.id, id)).limit(1))
    );
    res.json(vehicles.map(v => v[0]).filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "listFavorites error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.post("/favorites", async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.vehicleId, vehicleId)))
      .limit(1);

    if (existing[0]) return res.status(201).json(existing[0]);

    const fav = await db.insert(favoritesTable).values({ userId, vehicleId }).returning();
    res.status(201).json(fav[0]);
  } catch (err) {
    req.log.error({ err }, "addFavorite error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.delete("/favorites/by-vehicle", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const vehicleId = parseInt(req.query.vehicleId as string);
    if (!userId || !vehicleId) return res.status(400).json({ error: "userId und vehicleId erforderlich" });
    await db.delete(favoritesTable).where(
      and(eq(favoritesTable.userId, userId), eq(favoritesTable.vehicleId, vehicleId))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "removeFavoriteByVehicle error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.delete("/favorites/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(favoritesTable).where(eq(favoritesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "removeFavorite error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;

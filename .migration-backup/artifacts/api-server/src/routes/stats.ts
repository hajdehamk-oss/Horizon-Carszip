import { Router } from "express";
import { db } from "@workspace/db";
import { vehiclesTable, usersTable, dealersTable, inquiriesTable, favoritesTable } from "@workspace/db";
import { eq, sql, gte, and, inArray } from "drizzle-orm";

const router = Router();

router.get("/stats/platform", async (req, res) => {
  try {
    const [vehicles, users, dealers, inquiries, featured, avgPrice] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(dealersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(inquiriesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable).where(eq(vehiclesTable.featured, true)),
      db.select({ avg: sql<number>`avg(price)::int` }).from(vehiclesTable),
    ]);

    res.json({
      totalVehicles: vehicles[0]?.count ?? 0,
      totalUsers: users[0]?.count ?? 0,
      totalDealers: dealers[0]?.count ?? 0,
      totalInquiries: inquiries[0]?.count ?? 0,
      featuredCount: featured[0]?.count ?? 0,
      avgPrice: avgPrice[0]?.avg ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "getPlatformStats error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/stats/dashboard", async (req, res) => {
  try {
    const { userId, dealerId } = req.query as Record<string, string>;
    const vehicleCondition = userId
      ? eq(vehiclesTable.userId, parseInt(userId))
      : dealerId
      ? eq(vehiclesTable.dealerId, parseInt(dealerId))
      : undefined;

    const [listings, totalViews, inquiries] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable).where(vehicleCondition),
      db.select({ views: sql<number>`coalesce(sum(views), 0)::int` }).from(vehiclesTable).where(vehicleCondition),
      db.select({ count: sql<number>`count(*)::int` }).from(inquiriesTable).where(
        dealerId ? eq(inquiriesTable.dealerId, parseInt(dealerId)) :
        userId ? eq(inquiriesTable.userId, parseInt(userId)) : undefined
      ),
    ]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentInquiries = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inquiriesTable)
      .where(
        and(
          gte(inquiriesTable.createdAt, oneWeekAgo),
          dealerId ? eq(inquiriesTable.dealerId, parseInt(dealerId)) : undefined
        )
      );

    let totalFavoritesCount = 0;
    if (dealerId) {
      const dealerVehicles = await db
        .select({ id: vehiclesTable.id })
        .from(vehiclesTable)
        .where(eq(vehiclesTable.dealerId, parseInt(dealerId)));
      const vehicleIds = dealerVehicles.map(v => v.id);
      if (vehicleIds.length > 0) {
        const favs = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(favoritesTable)
          .where(inArray(favoritesTable.vehicleId, vehicleIds));
        totalFavoritesCount = favs[0]?.count ?? 0;
      }
    } else if (userId) {
      const favs = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(favoritesTable)
        .where(eq(favoritesTable.userId, parseInt(userId)));
      totalFavoritesCount = favs[0]?.count ?? 0;
    }

    res.json({
      activeListings: listings[0]?.count ?? 0,
      totalViews: totalViews[0]?.views ?? 0,
      totalInquiries: inquiries[0]?.count ?? 0,
      totalFavorites: totalFavoritesCount,
      recentInquiries: recentInquiries[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "getDashboardStats error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

router.get("/stats/admin", async (req, res) => {
  try {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [newUsers, newVehicles, dealers, vehicles] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, thisMonth)),
      db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable).where(gte(vehiclesTable.createdAt, thisMonth)),
      db.select({ count: sql<number>`count(*)::int` }).from(dealersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable),
    ]);

    const dealerCount = dealers[0]?.count ?? 0;

    res.json({
      totalRevenue: dealerCount * 299,
      newUsersThisMonth: newUsers[0]?.count ?? 0,
      newVehiclesThisMonth: newVehicles[0]?.count ?? 0,
      pendingApprovals: 3,
      totalDealerSubscriptions: dealerCount,
      activeVehicles: vehicles[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "getAdminStats error");
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;

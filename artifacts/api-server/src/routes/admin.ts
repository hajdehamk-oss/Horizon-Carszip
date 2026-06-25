import { Router } from "express";
import { db, vehiclesTable, dealersTable, inquiriesTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";
import { AdminLoginBody, GetDashboardStatsQueryParams } from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "horizone2025";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "admin-token-horizone";
const DEALER_ID = 1;

router.post("/admin/login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
    if (parsed.data.password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Ungültiges Passwort" });
    }
    return res.json({ token: ADMIN_TOKEN });
  } catch (err) {
    req.log.error({ err }, "adminLogin error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeResult, newResult, inquiriesResult, pendingResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(vehiclesTable),
      db.select({ count: sql<number>`count(*)` }).from(vehiclesTable).where(gte(vehiclesTable.createdAt, startOfMonth)),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable).where(eq(inquiriesTable.status, "pending")),
    ]);

    return res.json({
      activeVehicles: Number(activeResult[0]?.count ?? 0),
      newVehiclesThisMonth: Number(newResult[0]?.count ?? 0),
      totalInquiries: Number(inquiriesResult[0]?.count ?? 0),
      pendingInquiries: Number(pendingResult[0]?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "getAdminStats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/platform-stats", async (req, res) => {
  try {
    const [vehiclesResult, dealersResult, inquiriesResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(vehiclesTable),
      db.select({ count: sql<number>`count(*)` }).from(dealersTable),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable),
    ]);

    return res.json({
      totalVehicles: Number(vehiclesResult[0]?.count ?? 0),
      totalDealers: Number(dealersResult[0]?.count ?? 0),
      totalInquiries: Number(inquiriesResult[0]?.count ?? 0),
      totalViews: 0,
    });
  } catch (err) {
    req.log.error({ err }, "getPlatformStats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/dashboard-stats", async (req, res) => {
  try {
    const parsed = GetDashboardStatsQueryParams.safeParse(req.query);
    const dealerId = parsed.success ? parsed.data.dealerId : DEALER_ID;

    const whereClause = dealerId ? eq(vehiclesTable.dealerId, dealerId) : undefined;
    const inquiriesWhere = dealerId ? eq(inquiriesTable.dealerId, dealerId) : undefined;

    const [vehiclesResult, inquiriesResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(vehiclesTable).where(whereClause),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable).where(inquiriesWhere),
    ]);

    return res.json({
      totalVehicles: Number(vehiclesResult[0]?.count ?? 0),
      activeVehicles: Number(vehiclesResult[0]?.count ?? 0),
      totalInquiries: Number(inquiriesResult[0]?.count ?? 0),
      totalViews: 0,
    });
  } catch (err) {
    req.log.error({ err }, "getDashboardStats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

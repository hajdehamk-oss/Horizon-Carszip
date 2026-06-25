import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, vehiclesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/auth";
import { requireClientAuth } from "../middlewares/client-auth";

const router = Router();

export const ORDER_STEPS = [
  "Bestellung eingegangen",
  "Wird bearbeitet",
  "Unterwegs",
  "Im Hafen",
  "Zugestellt",
];

// Admin: list all orders
router.get("/orders", requireAdminAuth, async (_req, res) => {
  const rows = await db
    .select({
      id: ordersTable.id,
      currentStep: ordersTable.currentStep,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      vehicleId: vehiclesTable.id,
      vehicleTitle: vehiclesTable.title,
      vehicleBrand: vehiclesTable.brand,
      vehicleModel: vehiclesTable.model,
      vehicleYear: vehiclesTable.year,
      userId: usersTable.id,
      userName: usersTable.name,
      userEmail: usersTable.email,
      userPhone: usersTable.phone,
    })
    .from(ordersTable)
    .leftJoin(vehiclesTable, eq(ordersTable.vehicleId, vehiclesTable.id))
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(ordersTable.createdAt);
  res.json(rows);
});

// Admin: create order for a client
router.post("/orders", requireAdminAuth, async (req, res) => {
  const { vehicleId, userId, notes } = req.body;
  if (!vehicleId || !userId) {
    res.status(400).json({ error: "vehicleId und userId sind erforderlich" });
    return;
  }
  const [order] = await db
    .insert(ordersTable)
    .values({ vehicleId: Number(vehicleId), userId: Number(userId), notes: notes ?? null })
    .returning();
  res.status(201).json(order);
});

// Admin: update order step
router.patch("/orders/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { currentStep, notes } = req.body;
  if (currentStep === undefined || currentStep < 0 || currentStep > 4) {
    res.status(400).json({ error: "currentStep muss zwischen 0 und 4 liegen" });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ currentStep: Number(currentStep), ...(notes !== undefined ? { notes } : {}), updatedAt: new Date() })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) { res.status(404).json({ error: "Bestellung nicht gefunden" }); return; }
  res.json(order);
});

// Admin: delete order
router.delete("/orders/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(ordersTable).where(eq(ordersTable.id, id));
  res.status(204).send();
});

// Client: get own orders
router.get("/orders/mine", requireClientAuth, async (req, res) => {
  const { userId } = (req as any).clientUser;
  const rows = await db
    .select({
      id: ordersTable.id,
      currentStep: ordersTable.currentStep,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      vehicleId: vehiclesTable.id,
      vehicleTitle: vehiclesTable.title,
      vehicleBrand: vehiclesTable.brand,
      vehicleModel: vehiclesTable.model,
      vehicleYear: vehiclesTable.year,
      vehicleImages: vehiclesTable.images,
      vehiclePrice: vehiclesTable.price,
    })
    .from(ordersTable)
    .leftJoin(vehiclesTable, eq(ordersTable.vehicleId, vehiclesTable.id))
    .where(eq(ordersTable.userId, userId))
    .orderBy(ordersTable.createdAt);
  res.json(rows);
});

// Admin: list all users (for creating orders)
router.get("/clients", requireAdminAuth, async (_req, res) => {
  const users = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(usersTable.name);
  res.json(users);
});

export default router;

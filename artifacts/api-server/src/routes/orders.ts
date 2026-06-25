import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, vehiclesTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
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

const orderSelect = {
  id: ordersTable.id,
  currentStep: ordersTable.currentStep,
  status: ordersTable.status,
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
};

// Admin: list all orders
router.get("/orders", requireAdminAuth, async (_req, res) => {
  const rows = await db
    .select(orderSelect)
    .from(ordersTable)
    .leftJoin(vehiclesTable, eq(ordersTable.vehicleId, vehiclesTable.id))
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(ordersTable.createdAt);
  res.json(rows);
});

// Admin: create order for a client (starts as active, step 0)
router.post("/orders", requireAdminAuth, async (req, res) => {
  const { vehicleId, userId, notes } = req.body;
  if (!vehicleId || !userId) {
    res.status(400).json({ error: "vehicleId und userId sind erforderlich" });
    return;
  }
  const [order] = await db
    .insert(ordersTable)
    .values({ vehicleId: Number(vehicleId), userId: Number(userId), notes: notes ?? null, status: "active" })
    .returning();
  res.status(201).json(order);
});

// Admin: update order step and/or status
router.patch("/orders/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { currentStep, notes, status } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (currentStep !== undefined) {
    if (currentStep < 0 || currentStep > 4) {
      res.status(400).json({ error: "currentStep muss zwischen 0 und 4 liegen" });
      return;
    }
    updates.currentStep = Number(currentStep);
  }

  const [order] = await db
    .update(ordersTable)
    .set(updates)
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

// Client: submit a pre-order request for a vehicle
router.post("/orders/request", requireClientAuth, async (req, res) => {
  const { userId } = (req as any).clientUser;
  const { vehicleId, message } = req.body;
  if (!vehicleId) {
    res.status(400).json({ error: "vehicleId ist erforderlich" });
    return;
  }

  // Check vehicle exists
  const [vehicle] = await db.select({ id: vehiclesTable.id }).from(vehiclesTable).where(eq(vehiclesTable.id, Number(vehicleId))).limit(1);
  if (!vehicle) { res.status(404).json({ error: "Fahrzeug nicht gefunden" }); return; }

  // Prevent duplicate pending requests for same vehicle
  const existing = await db.select({ id: ordersTable.id }).from(ordersTable)
    .where(and(eq(ordersTable.userId, userId), eq(ordersTable.vehicleId, Number(vehicleId)), eq(ordersTable.status, "pending")))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Sie haben dieses Fahrzeug bereits angefragt" });
    return;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({ vehicleId: Number(vehicleId), userId, notes: message ?? null, status: "pending", currentStep: 0 })
    .returning();
  res.status(201).json(order);
});

// Client: get own orders (with status)
router.get("/orders/mine", requireClientAuth, async (req, res) => {
  const { userId } = (req as any).clientUser;
  const rows = await db
    .select({
      id: ordersTable.id,
      currentStep: ordersTable.currentStep,
      status: ordersTable.status,
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

// Admin: list all registered clients
router.get("/clients", requireAdminAuth, async (_req, res) => {
  const users = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(usersTable.name);
  res.json(users);
});

export default router;

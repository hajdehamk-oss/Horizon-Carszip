import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vehiclesTable = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  km: integer("km").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  color: text("color"),
  power: integer("power"),
  doors: integer("doors"),
  seats: integer("seats"),
  engineSize: text("engine_size"),
  vin: text("vin"),
  condition: text("condition").notNull().default("gebraucht"),
  featured: boolean("featured").notNull().default(false),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  dealerId: integer("dealer_id"),
  userId: integer("user_id"),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({ id: true, createdAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;

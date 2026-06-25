import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dealersTable = pgTable("dealers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  phone: text("phone"),
  email: text("email"),
  description: text("description"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehiclesTable = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  km: integer("km").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission"),
  power: integer("power"),
  color: text("color"),
  description: text("description"),
  images: text("images").array(),
  featured: boolean("featured").notNull().default(false),
  dealerId: integer("dealer_id").notNull().references(() => dealersTable.id),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehiclesTable.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  dealerId: integer("dealer_id").references(() => dealersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDealerSchema = createInsertSchema(dealersTable).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true, status: true });

export type Dealer = typeof dealersTable.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

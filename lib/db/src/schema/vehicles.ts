import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dealersTable = pgTable("dealers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city").notNull(),
  address: text("address"),
  logo: text("logo"),
  description: text("description"),
  subscriptionTier: text("subscription_tier").notNull().default("basic"),
  verified: boolean("verified").notNull().default(false),
  rating: integer("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  vehicleCount: integer("vehicle_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  dealerId: integer("dealer_id").references(() => dealersTable.id),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehiclesTable.id),
  dealerId: integer("dealer_id").references(() => dealersTable.id),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderPhone: text("sender_phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDealerSchema = createInsertSchema(dealersTable).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true, status: true });

export type Dealer = typeof dealersTable.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

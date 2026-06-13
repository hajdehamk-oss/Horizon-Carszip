import { pgTable, serial, text, boolean, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dealersTable = pgTable("dealers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  city: text("city").notNull(),
  address: text("address"),
  logo: text("logo"),
  description: text("description"),
  subscriptionTier: text("subscription_tier").notNull().default("basic"),
  verified: boolean("verified").notNull().default(false),
  rating: real("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  vehicleCount: integer("vehicle_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDealerSchema = createInsertSchema(dealersTable).omit({ id: true, createdAt: true });
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealersTable.$inferSelect;

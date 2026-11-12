import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  market: text("market").notNull(),
  name: text("name").notNull(),
  size: text("size").notNull().default("none"),
  price: real("price").notNull(),
  wholesalePrice: real("wholesale_price"),
  image: text("image").notNull(),
  ahash: text("ahash").notNull(),
  dhash: text("dhash").notNull(),
  colorR: real("color_r").notNull().default(0),
  colorG: real("color_g").notNull().default(0),
  colorB: real("color_b").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

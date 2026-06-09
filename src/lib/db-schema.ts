import {
  pgTable,
  text,
  numeric,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";

export const tickets = pgTable("tickets", {
  id:            serial("id").primaryKey(),
  ticketNumber:  text("ticket_number").notNull(),
  cashierName:   text("cashier_name").notNull(),
  date:          timestamp("date").notNull(),
  total:         numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  amountPaid:    numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  change:        numeric("change_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

export const ticketItems = pgTable("ticket_items", {
  id:        serial("id").primaryKey(),
  ticketId:  integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),
  quantity:  numeric("quantity",   { precision: 10, scale: 2 }).notNull(),
  unit:      text("unit").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),
  total:     numeric("total",      { precision: 10, scale: 2 }).notNull(),
});

export type TicketRow     = typeof tickets.$inferSelect;
export type TicketItemRow = typeof ticketItems.$inferSelect;

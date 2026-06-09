"use server";

import { getDb } from "@/lib/db";
import { tickets, ticketItems, type TicketRow } from "@/lib/db-schema";
import { eq, desc, gte, lte, and, count } from "drizzle-orm";
import type { TicketData } from "../types/ticket.types";

export type PageSize = 10 | 30 | 50 | "all";

export interface ListTicketsParams {
  dateFrom?: string;  // "YYYY-MM-DD"
  dateTo?:   string;  // "YYYY-MM-DD"
  page?:     number;
  pageSize?: PageSize;
}

export interface ListTicketsResult {
  rows:       TicketRow[];
  total:      number;
  page:       number;
  pageSize:   PageSize;
  totalPages: number;
}

/* ─── Guardar ticket completo ─── */
export async function saveTicket(ticket: TicketData): Promise<{ id: number }> {
  const db = getDb();

  const [row] = await db
    .insert(tickets)
    .values({
      ticketNumber:  ticket.ticketNumber,
      cashierName:   ticket.cashierName,
      date:          ticket.date,
      total:         String(ticket.total),
      paymentMethod: ticket.paymentMethod,
      amountPaid:    String(ticket.amountPaid),
      change:        String(ticket.change),
    })
    .returning({ id: tickets.id });

  await db.insert(ticketItems).values(
    ticket.items.map((item) => ({
      ticketId:  row.id,
      name:      item.name,
      quantity:  String(item.quantity),
      unit:      item.unit,
      unitPrice: String(item.unitPrice ?? 0),
      total:     String(item.total),
    }))
  );

  return { id: row.id };
}

/* ─── Listar tickets con filtros y paginación ─── */
export async function listTickets(params: ListTicketsParams = {}): Promise<ListTicketsResult> {
  const db       = getDb();
  const page     = params.page     ?? 1;
  const pageSize = params.pageSize ?? 10;

  // Construir condiciones WHERE
  const conditions = [];
  if (params.dateFrom) {
    conditions.push(gte(tickets.date, new Date(`${params.dateFrom}T00:00:00`)));
  }
  if (params.dateTo) {
    conditions.push(lte(tickets.date, new Date(`${params.dateTo}T23:59:59`)));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(tickets)
    .where(where);

  // Query con o sin límite
  const baseQuery = db.select().from(tickets).where(where).orderBy(desc(tickets.date));

  const rows = pageSize === "all"
    ? await baseQuery
    : await baseQuery.limit(pageSize).offset((page - 1) * pageSize);

  const totalPages = pageSize === "all" ? 1 : Math.ceil(total / pageSize);

  return { rows, total, page, pageSize, totalPages };
}

/* ─── Obtener ticket completo con items ─── */
export async function getTicket(id: number): Promise<TicketData | null> {
  const db = getDb();

  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!ticket) return null;

  const items = await db
    .select()
    .from(ticketItems)
    .where(eq(ticketItems.ticketId, id));

  return {
    ticketNumber:  ticket.ticketNumber,
    cashierName:   ticket.cashierName,
    date:          new Date(ticket.date),
    total:         parseFloat(ticket.total),
    paymentMethod: ticket.paymentMethod as TicketData["paymentMethod"],
    amountPaid:    parseFloat(ticket.amountPaid),
    change:        parseFloat(ticket.change),
    items: items.map((i) => ({
      id:        String(i.id),
      name:      i.name,
      quantity:  parseFloat(i.quantity),
      unit:      i.unit as TicketData["items"][number]["unit"],
      unitPrice: parseFloat(i.unitPrice ?? "0"),
      total:     parseFloat(i.total),
    })),
  };
}

/* ─── Actualizar ticket completo ─── */
export async function updateTicket(id: number, ticket: TicketData): Promise<void> {
  const db = getDb();

  await db
    .update(tickets)
    .set({
      ticketNumber:  ticket.ticketNumber,
      cashierName:   ticket.cashierName,
      date:          ticket.date,
      total:         String(ticket.total),
      paymentMethod: ticket.paymentMethod,
      amountPaid:    String(ticket.amountPaid),
      change:        String(ticket.change),
    })
    .where(eq(tickets.id, id));

  // Reemplazar items: borrar los anteriores e insertar los nuevos
  await db.delete(ticketItems).where(eq(ticketItems.ticketId, id));
  await db.insert(ticketItems).values(
    ticket.items.map((item) => ({
      ticketId:  id,
      name:      item.name,
      quantity:  String(item.quantity),
      unit:      item.unit,
      unitPrice: String(item.unitPrice ?? 0),
      total:     String(item.total),
    }))
  );
}

/* ─── Eliminar ticket ─── */
export async function deleteTicket(id: number): Promise<void> {
  const db = getDb();
  await db.delete(tickets).where(eq(tickets.id, id));
}

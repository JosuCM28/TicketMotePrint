"use server";

import { getDb } from "@/lib/db";
import { tickets, ticketItems } from "@/lib/db-schema";
import { eq, desc } from "drizzle-orm";
import type { TicketData } from "../types/ticket.types";

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

/* ─── Listar tickets (resumen para sidebar) ─── */
export async function listTickets() {
  const db = getDb();
  return db
    .select()
    .from(tickets)
    .orderBy(desc(tickets.createdAt))
    .limit(100);
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

import { z } from "zod";

export const ticketItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del producto es requerido").max(60),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unit: z.enum(["pza", "lt", "unid", "serv", "kg", "caja"]),
  unitPrice: z.number().positive("El precio unitario debe ser mayor a 0"),
});

export const ticketFormSchema = z.object({
  ticketNumber: z.string().min(1, "El folio es requerido").max(40),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().regex(/^[0-2]\d:[0-5]\d(:[0-5]\d)?$/, "Formato HH:MM o HH:MM:SS"),
  cashierName: z.string().min(2, "El nombre del encargado es requerido").max(60),
  items: z.array(ticketItemSchema).min(1, "Debes agregar al menos un producto"),
  paymentMethod: z.enum([
    "efectivo",
    "tarjeta_credito",
    "tarjeta_debito",
    "transferencia",
    "otro",
  ]),
  amountPaid: z.number().min(0, "El monto pagado no puede ser negativo"),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

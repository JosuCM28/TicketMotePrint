"use client";

import { useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ticketFormSchema, type TicketFormValues } from "../schemas/ticket-schema";
import { generateTicketNumber } from "@/lib/utils";
import type { TicketData, UnitType } from "../types/ticket.types";

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: "pza", label: "pza" },
  { value: "lt", label: "lt" },
  { value: "unid", label: "unid" },
  { value: "serv", label: "serv" },
  { value: "kg", label: "kg" },
  { value: "caja", label: "caja" },
];

const PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta_credito", label: "Tarjeta Crédito" },
  { value: "tarjeta_debito", label: "Tarjeta Débito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

interface TicketFormProps {
  onTicketReady: (t: TicketData) => void;
  initialData?: TicketData;   // si viene, es modo edición
}

function ticketDataToFormValues(data: TicketData): TicketFormValues {
  const d = new Date(data.date);
  return {
    ticketNumber:  data.ticketNumber,
    date:          d.toISOString().slice(0, 10),
    time:          `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
    cashierName:   data.cashierName,
    items:         data.items.map((i) => ({ ...i })),
    paymentMethod: data.paymentMethod,
    amountPaid:    data.amountPaid,
  };
}

export function TicketForm({ onTicketReady, initialData }: TicketFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TicketFormValues, unknown, TicketFormValues>({
    resolver: zodResolver(ticketFormSchema) as never,
    defaultValues: initialData
      ? ticketDataToFormValues(initialData)
      : {
          ticketNumber: generateTicketNumber(),
          date: nowDate(),
          time: nowTime(),
          cashierName: "",
          items: [{ id: crypto.randomUUID(), name: "", quantity: 1, unit: "pza", total: 0 }],
          paymentMethod: "efectivo",
          amountPaid: 0,
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");
  const watchAmountPaid = watch("amountPaid");

  // Total = suma de importes ingresados directamente
  const grandTotal = watchItems.reduce((s, i) => s + (i.total || 0), 0);
  const change = (watchAmountPaid || 0) - grandTotal;

  const addItem = useCallback(() => {
    append({ id: crypto.randomUUID(), name: "", quantity: 1, unit: "pza", total: 0 });
  }, [append]);

  const onSubmit = (data: TicketFormValues) => {
    const date = new Date(`${data.date}T${data.time}:00`);
    const total = data.items.reduce((s, i) => s + i.total, 0);

    const ticket: TicketData = {
      ticketNumber: data.ticketNumber,
      date,
      cashierName: data.cashierName,
      items: data.items,
      total,
      paymentMethod: data.paymentMethod,
      amountPaid: data.amountPaid,
      change: Math.max(0, data.amountPaid - total),
    };
    onTicketReady(ticket);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Folio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Folio del Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="ticketNumber">Número de folio *</Label>
            <Input
              id="ticketNumber"
              placeholder="ej. V4466C..."
              {...register("ticketNumber")}
            />
            <p className="text-xs text-muted-foreground">
              Se genera automáticamente, puedes modificarlo si lo necesitas.
            </p>
            {errors.ticketNumber && <p className="text-xs text-red-500">{errors.ticketNumber.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Fecha y hora */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fecha y Hora
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Fecha *</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time">Hora *</Label>
            <Input id="time" type="time" {...register("time")} />
            {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Encargado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Encargado y Cajero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="cashierName">Nombre completo *</Label>
            <Input id="cashierName" placeholder="ej. Gustavo Arcos Mora" {...register("cashierName")} />
            {errors.cashierName && <p className="text-xs text-red-500">{errors.cashierName.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Productos / Servicios
            </CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Encabezados desktop */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_64px_72px_100px_36px] gap-2 text-xs font-medium text-muted-foreground">
            <span>Producto / Descripción</span>
            <span>Cant.</span>
            <span>Unidad</span>
            <span>Importe $</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_64px_72px_100px_36px] sm:gap-2 sm:items-start border rounded-md p-3 sm:border-0 sm:rounded-none sm:p-0"
            >
              {/* Nombre */}
              <div>
                <Input placeholder="ej. Corona 1200" {...register(`items.${index}.name`)} />
                {errors.items?.[index]?.name && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.items[index]?.name?.message}</p>
                )}
              </div>

              {/* Cantidad + Unidad juntos en móvil */}
              <div className="flex gap-2 sm:block">
                <div className="flex-1 sm:flex-none">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="w-24 sm:hidden">
                  <Select
                    defaultValue="pza"
                    onValueChange={(v) => setValue(`items.${index}.unit`, v as UnitType)}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Unidad — solo desktop */}
              <div className="hidden sm:block">
                <Select
                  defaultValue="pza"
                  onValueChange={(v) => setValue(`items.${index}.unit`, v as UnitType)}
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Importe total (lo ingresa el usuario) */}
              <div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register(`items.${index}.total`, { valueAsNumber: true })}
                />
                {errors.items?.[index]?.total && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.items[index]?.total?.message}</p>
                )}
              </div>

              {/* Borrar */}
              <div className="flex justify-end sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-1 flex justify-end border-t">
            <span className="text-sm font-bold">Total: ${grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pago */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Forma de pago *</Label>
              <Select
                defaultValue="efectivo"
                onValueChange={(v) => setValue("paymentMethod", v as TicketFormValues["paymentMethod"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amountPaid">Monto recibido ($) *</Label>
              <Input
                id="amountPaid"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register("amountPaid", { valueAsNumber: true })}
              />
              {errors.amountPaid && <p className="text-xs text-red-500">{errors.amountPaid.message}</p>}
            </div>
          </div>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between font-extrabold text-base">
              <span>TOTAL</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            {(watchAmountPaid || 0) >= grandTotal && grandTotal > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Cambio</span>
                <span>${Math.max(0, change).toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg">
        Generar Nota de Venta
      </Button>
    </form>
  );
}

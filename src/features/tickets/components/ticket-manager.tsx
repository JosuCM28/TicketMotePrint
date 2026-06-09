"use client";

import { useState } from "react";
import { Printer, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketForm } from "./ticket-form";
import { TicketPreview } from "./ticket-preview";
import type { TicketData } from "../types/ticket.types";

type Step = "form" | "preview";

export function TicketManager() {
  const [step, setStep] = useState<Step>("form");
  const [ticket, setTicket] = useState<TicketData | null>(null);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Printer className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Tickets El Mote</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Vinos y Licores — Sistema de tickets
              </p>
            </div>
          </div>
          <Badge variant={step === "form" ? "default" : "secondary"}>
            {step === "form" ? "Nuevo Ticket" : "Vista Previa"}
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {step === "form" ? (
          <div className="max-w-2xl mx-auto no-print">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Nueva Nota de Venta</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ingresa los datos de la venta para generar el comprobante
              </p>
            </div>
            <TicketForm onTicketReady={(data: TicketData) => { setTicket(data); setStep("preview"); }} />
          </div>
        ) : (
          ticket && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-sm flex gap-3 no-print">
                <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" onClick={() => { setTicket(null); setStep("form"); }} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" /> Nuevo
                </Button>
                <Button onClick={handlePrint} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" /> Imprimir
                </Button>
              </div>

              {/* Wrapper que SE IMPRIME — sin overflow:hidden ni nada que corte */}
              <div id="print-wrapper">
                <TicketPreview ticket={ticket} />
              </div>

              <p className="text-xs text-muted-foreground no-print">
                Tickets El Mote · Impresora térmica 58mm
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

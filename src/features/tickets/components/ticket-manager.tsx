"use client";

import { useState, useTransition } from "react";
import { Printer, ArrowLeft, RotateCcw, Save, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketForm } from "./ticket-form";
import { TicketPreview } from "./ticket-preview";
import { TicketsSidebar } from "./tickets-sidebar";
import { saveTicket, getTicket } from "../actions/ticket-actions";
import type { TicketData } from "../types/ticket.types";

type Step = "form" | "preview";

export function TicketManager() {
  const [step, setStep]               = useState<Step>("form");
  const [ticket, setTicket]           = useState<TicketData | null>(null);
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [saveMsg, setSaveMsg]         = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const handlePrint = () => window.print();

  /* Guardar ticket actual en DB */
  const handleSave = () => {
    if (!ticket) return;
    startTransition(async () => {
      await saveTicket(ticket);
      setRefreshTrigger((n) => n + 1);
      setSaveMsg("¡Ticket guardado!");
      setTimeout(() => setSaveMsg(null), 2500);
    });
  };

  /* Cargar ticket guardado desde sidebar */
  const handleSelectSaved = (id: number) => {
    setSelectedId(id);
    startTransition(async () => {
      const data = await getTicket(id);
      if (data) {
        setTicket(data);
        setStep("preview");
        setSidebarOpen(false);
      }
    });
  };

  const handleNew = () => {
    setTicket(null);
    setSelectedId(null);
    setStep("form");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b sticky top-0 z-20 no-print">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botón sidebar móvil */}
            <button
              className="lg:hidden p-1.5 rounded hover:bg-gray-100"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Printer className="h-6 w-6 text-primary hidden sm:block" />
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

      {/* ── Layout principal ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar — siempre visible en lg, drawer en móvil ── */}
        <div
          className={`
            no-print
            fixed inset-y-0 left-0 z-30 w-72 pt-[57px] transition-transform duration-200
            lg:static lg:pt-0 lg:z-auto lg:translate-x-0 lg:w-64 lg:shrink-0 lg:flex lg:flex-col
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <TicketsSidebar
            onSelect={handleSelectSaved}
            selectedId={selectedId}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Overlay móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden no-print"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Contenido principal ── */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          {step === "form" ? (
            <div className="max-w-2xl mx-auto no-print">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Nueva Nota de Venta</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Ingresa los datos de la venta para generar el comprobante
                </p>
              </div>
              <TicketForm
                onTicketReady={(data: TicketData) => {
                  setTicket(data);
                  setSelectedId(null);
                  setStep("preview");
                }}
              />
            </div>
          ) : (
            ticket && (
              <div className="flex flex-col items-center gap-4">
                {/* Botones de acción */}
                <div className="w-full max-w-sm flex flex-wrap gap-2 no-print">
                  <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" onClick={handleNew} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-1" /> Nuevo
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isPending ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button onClick={handlePrint} className="flex-1">
                    <Printer className="h-4 w-4 mr-1" /> Imprimir
                  </Button>
                </div>

                {/* Mensaje de guardado */}
                {saveMsg && (
                  <div className="no-print bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
                    ✓ {saveMsg}
                  </div>
                )}

                {/* Vista previa del ticket */}
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
    </div>
  );
}

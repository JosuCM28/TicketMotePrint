"use client";

import { useState, useTransition } from "react";
import { Printer, ArrowLeft, RotateCcw, Save, Menu, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketForm } from "./ticket-form";
import { TicketPreview } from "./ticket-preview";
import { TicketsSidebar } from "./tickets-sidebar";
import { saveTicket, getTicket, updateTicket } from "../actions/ticket-actions";
import type { TicketData } from "../types/ticket.types";

type Step = "form" | "preview";

export function TicketManager() {
  const [step, setStep]               = useState<Step>("form");
  const [ticket, setTicket]           = useState<TicketData | null>(null);
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [editingData, setEditingData] = useState<TicketData | null>(null); // datos para pre-llenar form en edición
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [saveMsg, setSaveMsg]         = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const handlePrint = () => window.print();

  /* ── Guardar ticket nuevo en DB ── */
  const handleSave = () => {
    if (!ticket) return;
    startTransition(async () => {
      await saveTicket(ticket);
      setRefreshTrigger((n) => n + 1);
      setSaveMsg("¡Ticket guardado!");
      setTimeout(() => setSaveMsg(null), 2500);
    });
  };

  /* ── Actualizar ticket existente en DB ── */
  const handleUpdate = () => {
    if (!ticket || selectedId === null) return;
    startTransition(async () => {
      await updateTicket(selectedId, ticket);
      setRefreshTrigger((n) => n + 1);
      setSaveMsg("¡Ticket actualizado!");
      setTimeout(() => setSaveMsg(null), 2500);
    });
  };

  /* ── Cargar ticket guardado desde sidebar ── */
  const handleSelectSaved = (id: number) => {
    setSelectedId(id);
    startTransition(async () => {
      const data = await getTicket(id);
      if (data) {
        setTicket(data);
        setEditingData(null);
        setStep("preview");
        setSidebarOpen(false);
      }
    });
  };

  /* ── Entrar a editar el ticket cargado ── */
  const handleEditSaved = () => {
    if (!ticket) return;
    setEditingData(ticket);   // pre-llena el form con los datos actuales
    setStep("form");
  };

  /* ── Al enviar el form (nuevo o edición) ── */
  const handleFormReady = (data: TicketData) => {
    setTicket(data);
    setStep("preview");
  };

  /* ── Nuevo ticket en blanco ── */
  const handleNew = () => {
    setTicket(null);
    setSelectedId(null);
    setEditingData(null);
    setStep("form");
  };

  /* ── Volver al form sin perder los datos actuales ── */
  const handleBack = () => {
    // Si viene de un ticket guardado, pre-llena con esos datos
    if (ticket) setEditingData(ticket);
    setStep("form");
  };

  const isEditing   = selectedId !== null;  // true = ticket cargado desde DB
  const formTitle   = isEditing && editingData ? "Editar Ticket" : "Nueva Nota de Venta";
  const formSubtitle = isEditing && editingData
    ? "Modifica los datos y genera la vista previa para actualizar"
    : "Ingresa los datos de la venta para generar el comprobante";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b sticky top-0 z-20 no-print">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            {step === "form"
              ? (isEditing && editingData ? "Editando Ticket" : "Nuevo Ticket")
              : "Vista Previa"}
          </Badge>
        </div>
      </header>

      {/* ── Layout principal ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
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
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{formTitle}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{formSubtitle}</p>
                </div>
                {ticket && (
                  <Button variant="ghost" size="sm" onClick={() => setStep("preview")}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                  </Button>
                )}
              </div>
              <TicketForm
                key={editingData ? `edit-${selectedId}` : "new"}
                onTicketReady={handleFormReady}
                initialData={editingData ?? undefined}
                editingId={editingData && selectedId ? selectedId : undefined}
                onUpdated={() => setRefreshTrigger((n) => n + 1)}
              />
            </div>
          ) : (
            ticket && (
              <div className="flex flex-col items-center gap-4">
                {/* Botones de acción */}
                <div className="w-full max-w-sm flex flex-wrap gap-2 no-print">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Editar form
                  </Button>
                  <Button variant="outline" onClick={handleNew} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-1" /> Nuevo
                  </Button>

                  {/* Si es ticket guardado → Actualizar; si es nuevo → Guardar */}
                  {isEditing ? (
                    <Button
                      variant="secondary"
                      onClick={handleUpdate}
                      disabled={isPending}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      {isPending ? "Actualizando..." : "Actualizar"}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleSave}
                      disabled={isPending}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  )}

                  <Button onClick={handlePrint} className="flex-1">
                    <Printer className="h-4 w-4 mr-1" /> Imprimir
                  </Button>
                </div>

                {/* Si es ticket guardado, mostrar botón de editar datos del ticket */}
                {isEditing && (
                  <div className="w-full max-w-sm no-print">
                    <Button
                      variant="outline"
                      onClick={handleEditSaved}
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar datos de este ticket
                    </Button>
                  </div>
                )}

                {/* Mensaje de guardado / actualización */}
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
                  Tickets El Mote · Impresora térmica 80mm
                </p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

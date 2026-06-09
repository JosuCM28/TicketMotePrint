"use client";

import { useEffect, useState, useTransition } from "react";
import { Printer, Trash2, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listTickets, deleteTicket } from "../actions/ticket-actions";
import type { TicketRow } from "@/lib/db-schema";

interface Props {
  onSelect: (id: number) => void;
  selectedId: number | null;
  refreshTrigger: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo:        "Efectivo",
  tarjeta_credito: "T.Crédito",
  tarjeta_debito:  "T.Débito",
  transferencia:   "Transfer.",
  otro:            "Otro",
};

function pad2(n: number) { return String(n).padStart(2, "0"); }
function formatDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function TicketsSidebar({ onSelect, selectedId, refreshTrigger }: Props) {
  const [ticketList, setTicketList] = useState<TicketRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setLoading(true);
    listTickets().then((rows) => {
      setTicketList(rows);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [refreshTrigger]);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar este ticket?")) return;
    startTransition(async () => {
      await deleteTicket(id);
      load();
    });
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Tickets guardados</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            Cargando...
          </div>
        ) : ticketList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-1 text-center px-4">
            <Printer className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No hay tickets guardados</p>
          </div>
        ) : (
          <ul className="divide-y">
            {ticketList.map((t) => {
              const date = new Date(t.date);
              const isSelected = t.id === selectedId;
              return (
                <li
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`flex items-start gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{t.ticketNumber}</span>
                      <span className="text-xs font-bold text-green-700 shrink-0">
                        ${parseFloat(t.total).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{t.cashierName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(date)} {formatTime(date)}
                      </span>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        {PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, t.id)}
                    disabled={isPending}
                    className="mt-0.5 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer count */}
      {ticketList.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-muted-foreground">
          {ticketList.length} ticket{ticketList.length !== 1 ? "s" : ""}
        </div>
      )}
    </aside>
  );
}

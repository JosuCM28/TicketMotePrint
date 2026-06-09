"use client";

import { useEffect, useState, useTransition } from "react";
import { Printer, Trash2, RefreshCw, FileText, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listTickets, deleteTicket, type PageSize, type ListTicketsResult } from "../actions/ticket-actions";
import type { TicketRow } from "@/lib/db-schema";

interface Props {
  onSelect:       (id: number) => void;
  selectedId:     number | null;
  refreshTrigger: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo:        "Efectivo",
  tarjeta_credito: "T.Crédito",
  tarjeta_debito:  "T.Débito",
  transferencia:   "Transfer.",
  otro:            "Otro",
};

const PAGE_SIZES: { label: string; value: PageSize }[] = [
  { label: "10",  value: 10  },
  { label: "30",  value: 30  },
  { label: "50",  value: 50  },
  { label: "Todo", value: "all" },
];

function pad2(n: number) { return String(n).padStart(2, "0"); }
function formatDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}`;
}
function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

const EMPTY: ListTicketsResult = { rows: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

export function TicketsSidebar({ onSelect, selectedId, refreshTrigger }: Props) {
  const [result, setResult]       = useState<ListTicketsResult>(EMPTY);
  const [loading, setLoading]     = useState(true);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState<PageSize>(10);
  const [isPending, startTransition] = useTransition();

  const load = (overrides?: { page?: number; pageSize?: PageSize; dateFrom?: string; dateTo?: string }) => {
    setLoading(true);
    const p  = overrides?.page     ?? page;
    const ps = overrides?.pageSize ?? pageSize;
    const df = overrides?.dateFrom ?? dateFrom;
    const dt = overrides?.dateTo   ?? dateTo;
    listTickets({ page: p, pageSize: ps, dateFrom: df || undefined, dateTo: dt || undefined })
      .then((res) => { setResult(res); setLoading(false); });
  };

  // Recargar cuando cambia el trigger externo (nuevo ticket guardado)
  useEffect(() => { load(); }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = () => {
    setPage(1);
    load({ page: 1 });
  };

  const handleClearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
    load({ page: 1, dateFrom: "", dateTo: "" });
  };

  const handlePageSize = (ps: PageSize) => {
    setPageSize(ps);
    setPage(1);
    load({ page: 1, pageSize: ps });
  };

  const handlePage = (p: number) => {
    setPage(p);
    load({ page: p });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar este ticket?")) return;
    startTransition(async () => {
      await deleteTicket(id);
      load();
    });
  };

  const hasFilter = !!dateFrom || !!dateTo;
  const { rows, total, totalPages } = result;

  return (
    <aside className="flex flex-col h-full bg-white border-r w-full overflow-hidden">

      {/* ── Header ── */}
      <div className="px-3 pt-3 pb-2 border-b bg-gray-50 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Tickets guardados</span>
            {total > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">{total}</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filtro de fechas */}
        <div className="space-y-1.5">
          <div className="flex gap-1">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground font-medium">Desde</label>
              <Input
                type="date"
                className="h-7 text-xs px-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground font-medium">Hasta</label>
              <Input
                type="date"
                className="h-7 text-xs px-2"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleFilter}>
              <Search className="h-3 w-3 mr-1" /> Filtrar
            </Button>
            {hasFilter && (
              <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={handleClearFilter}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Selector de paginación */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground mr-1">Mostrar:</span>
          {PAGE_SIZES.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handlePageSize(value)}
              className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                pageSize === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-gray-200 hover:bg-gray-100 text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista de tickets ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Cargando...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-center px-4">
            <Printer className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              {hasFilter ? "Sin resultados para ese rango de fechas" : "No hay tickets guardados"}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((t: TicketRow) => {
              const date       = new Date(t.date);
              const isSelected = t.id === selectedId;
              return (
                <li
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`group px-3 py-2.5 cursor-pointer hover:bg-blue-50/60 transition-colors ${
                    isSelected ? "bg-primary/5 border-l-[3px] border-primary" : "border-l-[3px] border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      {/* Folio */}
                      <p className="text-[11px] font-bold truncate text-gray-800">
                        {t.ticketNumber}
                      </p>
                      {/* Cajero */}
                      <p className="text-[10px] text-muted-foreground truncate">{t.cashierName}</p>
                      {/* Fecha + hora */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(date)} {formatTime(date)}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 leading-none">
                          {PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-green-700">
                        ${parseFloat(t.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, t.id)}
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Paginación ── */}
      {!loading && totalPages > 1 && pageSize !== "all" && (
        <div className="shrink-0 border-t px-3 py-2 bg-gray-50 flex items-center justify-between gap-2">
          <Button
            variant="outline" size="icon"
            className="h-7 w-7"
            disabled={page <= 1}
            onClick={() => handlePage(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <span className="text-xs text-muted-foreground">
            Pág. <span className="font-semibold text-foreground">{page}</span> de{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>

          <Button
            variant="outline" size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => handlePage(page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ── Resumen total ── */}
      {!loading && rows.length > 0 && (
        <div className="shrink-0 px-3 py-1.5 border-t bg-gray-50 text-[10px] text-muted-foreground flex justify-between">
          <span>
            {pageSize !== "all"
              ? `${(page - 1) * (pageSize as number) + 1}–${Math.min(page * (pageSize as number), total)} de ${total}`
              : `${total} ticket${total !== 1 ? "s" : ""}`}
          </span>
          {hasFilter && <span className="text-blue-500 font-medium">Filtrado</span>}
        </div>
      )}
    </aside>
  );
}

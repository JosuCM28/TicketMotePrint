"use client";

import { numberToWords } from "@/lib/number-to-words";
import type { TicketData, CompanyInfo } from "../types/ticket.types";

const COMPANY: CompanyInfo = {
  name: "EL MOTE",
  subtitle: "Vinos y Licores",
  regimenFiscal: "PERSONAS FISICAS CON ACTIVIDADES EMPRESARIALES Y PROFESIONALES (612)",
  rfc: "AOMG9202213C2",
  domicilioFiscal: [
    "RUIZ CORTINEZ 1800 0, OBRERO CAMPESINA, XALAPA, CONTRA ESQ DE COMEX, VERACRUZ, MEXICO, C.P. 91020 TEL: 2281670722",
  ],
  tel: "",
  website: "www.easycaja.com.mx",
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo:        "Efectivo",
  tarjeta_credito: "T.Credito",
  tarjeta_debito:  "T.Debito",
  transferencia:   "Transfer.",
  otro:            "Otro",
};

function pad2(n: number) { return String(n).padStart(2, "0"); }
function fDate(d: Date)   { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function fTime(d: Date)   { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function fDateTime(d: Date) {
  return `${fDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function fMoney(n: number) {
  // Formato: $ 1,905.00
  return "$ " + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const FONT = "Arial, Helvetica, sans-serif";
const MONO = "'Courier New', Courier, monospace";

export function TicketPreview({ ticket }: { ticket: TicketData }) {
  const totalWords = numberToWords(Math.abs(ticket.total));

  return (
    <div
      id="ticket-content"
      style={{
        width: "100%",
        padding: "3mm 2mm 6mm 2mm",
        fontFamily: FONT,
        fontSize: "11px",
        lineHeight: "1.4",
        color: "#000",
        background: "#fff",
        boxSizing: "border-box",
        overflowX: "hidden",
        wordBreak: "break-word",
      }}
    >
      {/* ── NOTAS DE VENTA ── */}
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "900", fontFamily: FONT, letterSpacing: "0.5px" }}>
        NOTAS DE VENTA
      </div>

      {/* ── FOLIO + FECHA ── */}
      <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold", marginTop: "2px", fontFamily: FONT }}>
        FOLIO: {ticket.ticketNumber}&nbsp;&nbsp;{fDate(ticket.date)}
      </div>

      {/* ── HORA centrada en su propia línea ── */}
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "bold", fontFamily: FONT }}>
        {fTime(ticket.date)}
      </div>

      {/* ── EL MOTE ── */}
      <div style={{ textAlign: "center", marginTop: "2px" }}>
        <div style={{ fontSize: "13px", fontWeight: "900", letterSpacing: "1px", fontFamily: FONT }}>
          {COMPANY.name}
        </div>
        <div style={{ fontSize: "11px", fontFamily: FONT }}>{COMPANY.subtitle}</div>
      </div>

      {/* ── BOX 1 — Régimen Fiscal ── */}
      <div style={{
        border: "1px solid #000", padding: "3px 5px", margin: "5px 0 3px",
        fontSize: "11px", lineHeight: "1.4", fontFamily: FONT, wordBreak: "break-word",
      }}>
        <div style={{ fontWeight: "bold" }}>REGIMEN FISCAL</div>
        {COMPANY.regimenFiscal.split("\n").map((l, i) => <div key={i}>{l}</div>)}
        <div>RFC: {COMPANY.rfc}</div>
      </div>

      {/* ── BOX 2 — Domicilio Fiscal ── */}
      <div style={{
        border: "1px solid #000", padding: "3px 5px", margin: "3px 0",
        fontSize: "11px", lineHeight: "1.4", fontFamily: FONT, wordBreak: "break-word",
      }}>
        <div style={{ fontWeight: "bold" }}>DOMICILIO FISCAL</div>
        {COMPANY.domicilioFiscal.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {/* ── BOX 3 — Encargado y Cajero ── */}
      <div style={{
        border: "1px solid #000", padding: "3px 5px", margin: "3px 0 5px",
        fontSize: "11px", lineHeight: "1.4", fontFamily: FONT,
      }}>
        <div style={{ fontWeight: "bold" }}>ENCARGADO Y CAJERO</div>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>{ticket.cashierName.toUpperCase()}</div>
      </div>

      {/* ── Bienvenidos ── */}
      <div style={{ textAlign: "center", fontSize: "11px", margin: "2px 0 4px", fontFamily: FONT }}>
        Bienvenidos..
      </div>
      <div style={{ borderTop: "0.5px solid #000", margin: "0 0 5px" }} />

      {/* ── Items ── */}
      <div style={{ width: "100%", marginBottom: "4px" }}>
        {ticket.items.map((item, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between",
            width: "100%", fontSize: "12px", lineHeight: "1.5",
            marginBottom: "1px", fontFamily: FONT,
          }}>
            <span style={{ flex: 1, minWidth: 0, paddingRight: "4px" }}>
              {item.quantity} {item.unit} {item.name}
            </span>
            <span style={{ flexShrink: 0 }}>
              {item.total < 0
                ? `- ${fMoney(Math.abs(item.total))}`
                : fMoney(item.total)}
            </span>
          </div>
        ))}

        {/* * N registros */}
        <div style={{ fontSize: "11px", marginTop: "3px", fontFamily: FONT }}>
          * {ticket.items.length} registro{ticket.items.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── TOTAL ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        width: "100%", marginTop: "2px",
      }}>
        <span style={{ fontWeight: "bold", fontSize: "13px", fontFamily: FONT }}>TOTAL</span>
        <span style={{ fontWeight: "900", fontSize: "18px", fontFamily: FONT }}>
          {fMoney(ticket.total)}
        </span>
      </div>

      {/* ── Total en letras ── */}
      <div style={{ fontSize: "11px", fontWeight: "600", margin: "1px 0 4px", fontFamily: FONT, lineHeight: "1.3" }}>
        {totalWords}.
      </div>

      {/* ── * METODO DE PAGO ── */}
      <div style={{ fontSize: "12px", fontWeight: "bold", fontFamily: FONT, marginBottom: "2px" }}>
        * METODO DE PAGO
      </div>

      {/* fecha hora método    $ monto */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontSize: "11px", fontFamily: FONT, marginBottom: "4px",
      }}>
        <span>
          {fDateTime(ticket.date)}&nbsp;{PAYMENT_LABELS[ticket.paymentMethod] ?? ticket.paymentMethod}
        </span>
        <span style={{ fontWeight: "bold", flexShrink: 0, marginLeft: "4px" }}>
          {fMoney(ticket.amountPaid > 0 ? ticket.amountPaid : ticket.total)}
        </span>
      </div>

      {/* ── Pie ── */}
      <div style={{ borderTop: "0.5px solid #000", margin: "4px 0 4px" }} />
      <div style={{ textAlign: "center", fontSize: "11px", fontFamily: FONT }}>
        Punto de venta <span style={{ textDecoration: "underline" }}>{COMPANY.website}</span>
      </div>

      {/* Línea negra fina — fuerza el corte de papel */}
      <div style={{ height: "20mm", display: "flex", alignItems: "flex-end" }}>
        <div style={{ width: "100%", height: "0.2px", background: "#000" }} />
      </div>
    </div>
  );
}

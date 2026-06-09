"use client";

import { numberToWords } from "@/lib/number-to-words";
import type { TicketData, CompanyInfo } from "../types/ticket.types";

const COMPANY: CompanyInfo = {
  name: "EL MOTE",
  subtitle: "Vinos y Licores",
  regimenFiscal: "PERSONAS FÍSICAS CON\nACTIVIDADES EMPRESARIALES\nY PROFESIONALES (612)",
  rfc: "AOMG9202213C2",
  domicilioFiscal: [
    "RUIZ CORTINES 1800 0, OBRERA",
    "CAMPESIONA, XALAPA,",
    "CONTRA ESQ DE COMEX,",
    "VERACRUZ, MEXICO, CP. 91020",
  ],
  tel: "TEL 2281670722",
  website: "www.easycaja.com.mx",
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta_credito: "T.Credito",
  tarjeta_debito: "T.Debito",
  transferencia: "Transfer.",
  otro: "Otro",
};

function pad2(n: number) { return String(n).padStart(2, "0"); }
function fDate(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function fTime(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function fDateTime(d: Date) {
  return `${fDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
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
        padding: "2mm 2mm 6mm 2mm",
        fontFamily: FONT,
        fontSize: "11px",
        lineHeight: "1.35",
        color: "#000",
        background: "#fff",
        boxSizing: "border-box",
        overflowX: "hidden",
        wordBreak: "break-word",
      }}
    >
      {/* NOTA DE VENTA */}
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "900", fontFamily: FONT }}>
        NOTA DE VENTA
      </div>

      {/* FOLIO */}
      <div style={{ fontSize: "9px", fontWeight: "bold", marginTop: "2px", fontFamily: MONO }}>
        <div>FOLIO: {ticket.ticketNumber}</div>
        <div>{fDate(ticket.date)} {fTime(ticket.date)}</div>
      </div>

      {/* EL MOTE */}
      <div style={{ textAlign: "center", margin: "3px 0 0" }}>
        <div style={{ fontSize: "13px", fontWeight: "900", letterSpacing: "1px", fontFamily: FONT }}>
          {COMPANY.name}
        </div>
        <div style={{ fontSize: "10px", fontFamily: FONT }}>{COMPANY.subtitle}</div>
      </div>

      {/* BOX 1 — Régimen Fiscal */}
      <div style={{ border: "1px solid #000", padding: "3px 4px", margin: "3px 0 2px", fontSize: "10px", lineHeight: "1.35", fontFamily: FONT, wordBreak: "break-word" }}>
        <div style={{ fontWeight: "bold" }}>RÉGIMEN FISCAL</div>
        {COMPANY.regimenFiscal.split("\n").map((l, i) => <div key={i}>{l}</div>)}
        <div style={{ fontWeight: "bold" }}>RFC: {COMPANY.rfc}</div>
      </div>

      {/* BOX 2 — Domicilio Fiscal */}
      <div style={{ border: "1px solid #000", padding: "3px 4px", margin: "2px 0", fontSize: "10px", lineHeight: "1.35", fontFamily: FONT, wordBreak: "break-word" }}>
        <div style={{ fontWeight: "bold" }}>DOMICILIO FISCAL</div>
        {COMPANY.domicilioFiscal.map((l, i) => <div key={i}>{l}</div>)}
        <div>{COMPANY.tel}</div>
      </div>

      {/* BOX 3 — Encargado y Cajero */}
      <div style={{ border: "1px solid #000", padding: "3px 4px", margin: "2px 0 3px", fontSize: "10px", lineHeight: "1.35", fontFamily: FONT }}>
        <div style={{ fontWeight: "bold" }}>ENCARGADO Y CAJERO</div>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>{ticket.cashierName.toUpperCase()}</div>
      </div>

      {/* Bienvenidos */}
      <div style={{ fontSize: "11px", margin: "3px 0 5px", fontFamily: FONT }}>Bienvenidos.</div>

      {/* Items */}
      <div style={{ width: "100%", marginBottom: "3px" }}>
        {ticket.items.map((item, i) => {
          const neg = item.total < 0;
          const precio = neg ? `-${Math.abs(item.total).toFixed(2)}` : `$${item.total.toFixed(2)}`;
          return (
            <div key={i} style={{ display: "flex", width: "100%", fontSize: "13px", lineHeight: "1.4", marginBottom: "2px", fontFamily: MONO, fontWeight: "bold" }}>
              <span style={{ flex: 1, minWidth: 0, paddingRight: "3px" }}>
                {item.quantity} {item.unit} {item.name}
              </span>
              <span style={{ flexShrink: 0, fontWeight: "bold" }}>
                {precio}
              </span>
            </div>
          );
        })}
        <div style={{ fontSize: "11px", fontWeight: "bold", marginTop: "2px", fontFamily: FONT }}>
          • {ticket.items.length} registro{ticket.items.length !== 1 ? "s" : ""}.
        </div>
      </div>

      {/* Línea sólida */}
      <div style={{ borderTop: "1px solid #000", margin: "3px 0 2px" }} />

      {/* TOTAL */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%" }}>
        <span style={{ fontWeight: "bold", fontSize: "13px", fontFamily: FONT }}>TOTAL</span>
        <span style={{ fontWeight: "900", fontSize: "17px", fontFamily: FONT }}>
          ${ticket.total.toFixed(2)}
        </span>
      </div>

      {/* Total en letras */}
      <div style={{ fontSize: "10px", fontWeight: "600", marginBottom: "3px", fontFamily: FONT, lineHeight: "1.3" }}>
        {totalWords}.
      </div>

      {/* Línea punteada */}
      <div style={{ borderTop: "1px dashed #000", margin: "3px 0 2px" }} />

      {/* Método de pago */}
      <div style={{ fontSize: "12px", fontWeight: "bold", fontFamily: FONT, marginBottom: "2px" }}>
        • MÉTODO DE PAGO
      </div>
      <div style={{ fontSize: "11px", fontWeight: "bold", fontFamily: MONO }}>
        {fDateTime(ticket.date)} {PAYMENT_LABELS[ticket.paymentMethod] ?? ticket.paymentMethod}
      </div>

      {/* Línea sólida */}
      <div style={{ borderTop: "1px solid #000", margin: "3px 0 2px" }} />

      {/* Pie */}
      <div style={{ fontSize: "11px", fontWeight: "bold", textAlign: "center", fontFamily: FONT }}>
        Punto de venta {COMPANY.website}
      </div>

      {/* Línea negra fina al final — fuerza a la impresora a avanzar hasta este punto */}
      <div style={{ height: "20mm", display: "flex", alignItems: "flex-end" }}>
        <div style={{ width: "100%", height: "0.2px", background: "#000" }} />
      </div>
    </div>
  );
}

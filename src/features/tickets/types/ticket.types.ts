export type PaymentMethod =
  | "efectivo"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "transferencia"
  | "otro";

export type UnitType = "pza" | "lt" | "unid" | "serv" | "kg" | "caja";

export interface TicketItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number; // precio por unidad
  total: number;     // calculado: quantity × unitPrice
}

export interface TicketData {
  ticketNumber: string;
  date: Date;
  cashierName: string;
  items: TicketItem[];
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
}

export interface CompanyInfo {
  name: string;
  subtitle: string;
  regimenFiscal: string;
  rfc: string;
  domicilioFiscal: string[];
  tel: string;
  website: string;
}

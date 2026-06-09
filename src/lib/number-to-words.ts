const UNIDADES = [
  "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS",
  "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
];

const DECENAS = [
  "", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA",
  "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
];

const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
];

function convertirMenorMil(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  if (n < 20) return UNIDADES[n];

  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;

  let resultado = "";
  if (c > 0) resultado += CENTENAS[c] + (n % 100 > 0 ? " " : "");

  if (d === 2 && u > 0) {
    resultado += "VEINTI" + UNIDADES[u].toLowerCase().replace(/^./, (s) => s.toUpperCase());
    // Keep uppercase
    resultado = resultado.replace("VEINTIun", "VEINTIÚN");
  } else if (d > 0) {
    resultado += DECENAS[d];
    if (u > 0) resultado += " Y " + UNIDADES[u];
  } else if (u > 0) {
    resultado += UNIDADES[u];
  }

  return resultado;
}

export function numberToWords(amount: number): string {
  const entero = Math.floor(amount);
  const centavos = Math.round((amount - entero) * 100);

  let resultado = "";

  if (entero === 0) {
    resultado = "CERO";
  } else if (entero < 1000) {
    resultado = convertirMenorMil(entero);
  } else if (entero < 1_000_000) {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    if (miles === 1) {
      resultado = "MIL";
    } else {
      resultado = convertirMenorMil(miles) + " MIL";
    }
    if (resto > 0) resultado += " " + convertirMenorMil(resto);
  } else if (entero < 1_000_000_000) {
    const millones = Math.floor(entero / 1_000_000);
    const resto = entero % 1_000_000;
    resultado = convertirMenorMil(millones) + (millones === 1 ? " MILLÓN" : " MILLONES");
    if (resto > 0) {
      const miles = Math.floor(resto / 1000);
      const r2 = resto % 1000;
      if (miles > 0) resultado += " " + convertirMenorMil(miles) + " MIL";
      if (r2 > 0) resultado += " " + convertirMenorMil(r2);
    }
  }

  return `${resultado} PESOS ${String(centavos).padStart(2, "0")}/100`;
}

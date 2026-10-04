// Periodos de los informes de Estadísticas. Todas las fechas son días
// locales en formato yyyy-MM-dd, con `from` y `to` inclusive.
//
// La agenda es de registros diarios, así que un informe recién tiene sentido
// cuando el periodo terminó:
// - Hoy: en vivo, lo que va registrado.
// - Semanal (lunes a domingo): el domingo se ve la semana en curso; antes de
//   eso, la última semana completa.
// - Mensual: el último día del mes se ve el mes en curso; antes, el anterior.
// - Anual: siempre lo que va del año (o el año completo, si es uno pasado).

import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isLastDayOfMonth,
  isSunday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

export type ReportKind = "day" | "week" | "month" | "year";

export interface Period {
  kind: ReportKind;
  from: string;
  to: string;
}

const iso = (d: Date) => format(d, "yyyy-MM-dd");

function periodContaining(kind: ReportKind, date: Date, now: Date): Period {
  switch (kind) {
    case "day":
      return { kind, from: iso(date), to: iso(date) };
    case "week":
      return {
        kind,
        from: iso(startOfWeek(date, { weekStartsOn: 1 })),
        to: iso(endOfWeek(date, { weekStartsOn: 1 })),
      };
    case "month":
      return { kind, from: iso(startOfMonth(date)), to: iso(endOfMonth(date)) };
    case "year": {
      const isCurrentYear = date.getFullYear() === now.getFullYear();
      return { kind, from: iso(startOfYear(date)), to: iso(isCurrentYear ? now : endOfYear(date)) };
    }
  }
}

// El informe más reciente que ya se puede ver.
export function latestPeriod(kind: ReportKind, now: Date): Period {
  switch (kind) {
    case "week":
      return periodContaining(kind, isSunday(now) ? now : addDays(now, -7), now);
    case "month":
      return periodContaining(kind, isLastDayOfMonth(now) ? now : addMonths(now, -1), now);
    default:
      return periodContaining(kind, now, now);
  }
}

export function shiftPeriod(period: Period, delta: number, now: Date): Period {
  const from = parseISO(period.from);
  switch (period.kind) {
    case "day":
      return periodContaining("day", addDays(from, delta), now);
    case "week":
      return periodContaining("week", addDays(from, 7 * delta), now);
    case "month":
      return periodContaining("month", addMonths(from, delta), now);
    case "year":
      return periodContaining("year", addYears(from, delta), now);
  }
}

// Periodo con el que se compara. Para el año en curso (incompleto) se
// compara contra el mismo tramo del año anterior, para que sea justo.
export function comparisonPeriod(period: Period, now: Date): Period {
  if (period.kind === "year" && parseISO(period.from).getFullYear() === now.getFullYear()) {
    return { kind: "year", from: iso(addYears(parseISO(period.from), -1)), to: iso(addYears(parseISO(period.to), -1)) };
  }
  return shiftPeriod(period, -1, now);
}

export function canGoForward(period: Period, now: Date): boolean {
  return shiftPeriod(period, 1, now).from <= latestPeriod(period.kind, now).from;
}

// Semana/mes en curso cuyo informe todavía no está listo (para avisar
// "tu informe de esta semana llega el domingo").
export function pendingCurrentPeriod(kind: ReportKind, now: Date): Period | null {
  if (kind === "week" && !isSunday(now)) return periodContaining("week", now, now);
  if (kind === "month" && !isLastDayOfMonth(now)) return periodContaining("month", now, now);
  return null;
}

// Lunes de la semana de una fecha (para agrupar por semana).
export function weekStartOf(date: string): string {
  return iso(startOfWeek(parseISO(date), { weekStartsOn: 1 }));
}

import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { supabase } from "@/lib/supabase";
import type { ResumenData, ResumenPeriod } from "@/features/resumen/types";

const DATE_FORMAT = "yyyy-MM-dd";

export function getPeriodRange(period: ResumenPeriod, anchor: Date = new Date()) {
  switch (period) {
    case "weekly":
      return {
        from: format(startOfWeek(anchor, { weekStartsOn: 1 }), DATE_FORMAT),
        to: format(endOfWeek(anchor, { weekStartsOn: 1 }), DATE_FORMAT),
      };
    case "monthly":
      return { from: format(startOfMonth(anchor), DATE_FORMAT), to: format(endOfMonth(anchor), DATE_FORMAT) };
    case "yearly":
      return { from: format(startOfYear(anchor), DATE_FORMAT), to: format(endOfYear(anchor), DATE_FORMAT) };
  }
}

// period_key único por período mostrado, usado para el bonus de MOOney por
// compartir (grant_mooney_for_resumen) — así compartir la misma semana dos
// veces no acredita dos veces.
export function getPeriodKey(period: ResumenPeriod, anchor: Date = new Date()) {
  const { from } = getPeriodRange(period, anchor);
  return `${period}:${from}`;
}

export async function fetchResumen(period: ResumenPeriod, anchor: Date = new Date()): Promise<ResumenData> {
  const { from, to } = getPeriodRange(period, anchor);
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke<ResumenData>("resumen", {
    body: { from, to },
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (error) throw error;
  return data as ResumenData;
}

import { supabase } from "@/lib/supabase";
import type { HygieneItem, HygieneLog, HygieneLogDetail } from "@/features/higiene/types";

const PAGE_SIZE = 14; // ~2 semanas de historial por página

export async function fetchActiveHygieneItems(userId: string): Promise<HygieneItem[]> {
  const { data, error } = await supabase
    .from("hygiene_items")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createHygieneItem(userId: string, label: string, icon?: string) {
  const { error } = await supabase
    .from("hygiene_items")
    .insert({ user_id: userId, label, icon: icon ?? null, sort_order: 0, is_active: true });
  if (error) throw error;
}

export async function deactivateHygieneItem(itemId: string) {
  const { error } = await supabase
    .from("hygiene_items")
    .update({ is_active: false })
    .eq("id", itemId);
  if (error) throw error;
}

export async function fetchLogsForDate(userId: string, date: string): Promise<HygieneLog[]> {
  const { data, error } = await supabase
    .from("hygiene_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", date);
  if (error) throw error;
  return data ?? [];
}

// Detalle de qué ítems se marcaron (o no) en una fecha puntual del
// historial, con su label/ícono — para el modal de "qué hice ese día".
export async function fetchLogDetailsForDate(userId: string, date: string): Promise<HygieneLogDetail[]> {
  const { data, error } = await supabase
    .from("hygiene_logs")
    .select("id, hygiene_item_id, completed, hygiene_items(label, icon)")
    .eq("user_id", userId)
    .eq("log_date", date);
  if (error) throw error;
  return (data ?? []) as unknown as HygieneLogDetail[];
}

export async function toggleHygieneLog(
  userId: string,
  hygieneItemId: string,
  date: string,
  completed: boolean,
  isHairWash?: boolean
) {
  const { error } = await supabase.from("hygiene_logs").upsert(
    {
      user_id: userId,
      hygiene_item_id: hygieneItemId,
      log_date: date,
      completed,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,hygiene_item_id,log_date" }
  );
  if (error) throw error;

  // El ítem "Lavado de pelo" es un check más del checklist, pero además deja
  // un registro con fecha/hora exacta en hair_wash_logs (para el historial
  // "cada cuánto te lavás el pelo" del módulo Pelo). Solo se registra al
  // marcar, no al desmarcar, para no borrar historial real por error.
  if (isHairWash && completed) {
    const { error: hairWashError } = await supabase.from("hair_wash_logs").insert({ user_id: userId });
    if (hairWashError) throw hairWashError;
  }
}

// Historial agrupado por día y paginado en memoria. Paginar directo sobre
// filas crudas (una por ítem) partía un mismo día en dos páginas distintas
// cuando sus registros caían justo en el límite de la página, mostrando el
// mismo día dos veces en el historial — por eso agrupamos primero (con
// columnas livianas, log_date+completed) y recién ahí paginamos por día.
export async function fetchHygieneHistoryPage(userId: string, page: number) {
  const { data, error } = await supabase
    .from("hygiene_logs")
    .select("log_date, completed")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(5000);

  if (error) throw error;

  const byDate = new Map<string, { total: number; completed: number }>();
  for (const row of data ?? []) {
    const entry = byDate.get(row.log_date) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (row.completed) entry.completed += 1;
    byDate.set(row.log_date, entry);
  }

  const allDays = Array.from(byDate.entries())
    .map(([log_date, v]) => ({ log_date, totalItems: v.total, completedItems: v.completed }))
    .sort((a, b) => (a.log_date < b.log_date ? 1 : -1));

  const from = page * PAGE_SIZE;
  const items = allDays.slice(from, from + PAGE_SIZE);

  return { items, nextPage: from + PAGE_SIZE < allDays.length ? page + 1 : undefined };
}

// Borra el registro completo de un día (todos los ítems marcados ese día).
export async function deleteHygieneDay(userId: string, date: string) {
  const { error } = await supabase
    .from("hygiene_logs")
    .delete()
    .eq("user_id", userId)
    .eq("log_date", date);
  if (error) throw error;
}

export { PAGE_SIZE };

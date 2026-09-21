import { supabase } from "@/lib/supabase";
import type { Json } from "@/lib/database.types";
import type { DetailedTaste, QuickTaste, TasteCategory, TasteDetails } from "@/features/gustos/types";

const PAGE_SIZE = 20;

export async function createQuickTaste(
  userId: string,
  input: { name: string; description?: string; rating?: number }
) {
  const { error } = await supabase.from("taste_quick_logs").insert({
    user_id: userId,
    name: input.name,
    description: input.description ?? null,
    rating: input.rating ?? null,
  });
  if (error) throw error;
}

export async function updateQuickTaste(
  id: string,
  input: { name: string; description?: string; rating?: number }
) {
  const { error } = await supabase
    .from("taste_quick_logs")
    .update({
      name: input.name,
      description: input.description ?? null,
      rating: input.rating ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuickTaste(id: string) {
  const { error } = await supabase.from("taste_quick_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchQuickTastesPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("taste_quick_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as QuickTaste[], nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined };
}

export async function createDetailedTaste(
  userId: string,
  input: {
    category: TasteCategory;
    name: string;
    genre?: string;
    notes?: string;
    details: TasteDetails;
    rating?: number;
  }
) {
  const { error } = await supabase.from("taste_detailed_logs").insert({
    user_id: userId,
    category: input.category,
    name: input.name,
    genre: input.genre ?? null,
    notes: input.notes ?? null,
    // TasteDetails son todos campos opcionales de texto; Json exige un
    // index signature explícito que la interfaz de dominio no necesita.
    details: input.details as Json,
    rating: input.rating ?? null,
  });
  if (error) throw error;
}

export async function updateDetailedTaste(
  id: string,
  input: {
    category: TasteCategory;
    name: string;
    genre?: string;
    notes?: string;
    details: TasteDetails;
    rating?: number;
  }
) {
  const { error } = await supabase
    .from("taste_detailed_logs")
    .update({
      category: input.category,
      name: input.name,
      genre: input.genre ?? null,
      notes: input.notes ?? null,
      details: input.details as Json,
      rating: input.rating ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDetailedTaste(id: string) {
  const { error } = await supabase.from("taste_detailed_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchDetailedTastesPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("taste_detailed_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    items: (data ?? []) as unknown as DetailedTaste[],
    nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined,
  };
}

export { PAGE_SIZE };

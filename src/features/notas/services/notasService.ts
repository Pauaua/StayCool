import { supabase } from "@/lib/supabase";
import type { DetailedNote, QuickNote } from "@/features/notas/types";

const PAGE_SIZE = 20;

export async function createQuickNote(
  userId: string,
  input: { name: string; description?: string; feeling?: string }
) {
  const { error } = await supabase.from("note_quick_logs").insert({
    user_id: userId,
    name: input.name,
    description: input.description ?? null,
    feeling: input.feeling ?? null,
  });
  if (error) throw error;
}

export async function updateQuickNote(
  id: string,
  input: { name: string; description?: string; feeling?: string }
) {
  const { error } = await supabase
    .from("note_quick_logs")
    .update({ name: input.name, description: input.description ?? null, feeling: input.feeling ?? null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuickNote(id: string) {
  const { error } = await supabase.from("note_quick_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchQuickNotesPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("note_quick_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as QuickNote[], nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined };
}

export async function createDetailedNote(
  userId: string,
  input: { name: string; location?: string; idea: string; feelings?: string; thoughts?: string }
) {
  const { error } = await supabase.from("note_detailed_logs").insert({
    user_id: userId,
    name: input.name,
    location: input.location ?? null,
    idea: input.idea,
    feelings: input.feelings ?? null,
    thoughts: input.thoughts ?? null,
  });
  if (error) throw error;
}

export async function updateDetailedNote(
  id: string,
  input: { name: string; location?: string; idea: string; feelings?: string; thoughts?: string }
) {
  const { error } = await supabase
    .from("note_detailed_logs")
    .update({
      name: input.name,
      location: input.location ?? null,
      idea: input.idea,
      feelings: input.feelings ?? null,
      thoughts: input.thoughts ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDetailedNote(id: string) {
  const { error } = await supabase.from("note_detailed_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchDetailedNotesPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("note_detailed_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as DetailedNote[], nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined };
}

export { PAGE_SIZE };

import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { buildReport, type IdentityHistory, type RangeData, type Report } from "@/features/estadisticas/logic/aggregate";
import { comparisonPeriod, type Period } from "@/features/estadisticas/logic/periods";

// Supabase devuelve como máximo 1000 filas por consulta; un informe anual
// puede tener más (ej. el checklist de higiene, varias filas por día), así
// que se pide en páginas.
const PAGE_SIZE = 1000;

async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await page(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function countRows(table: "note_quick_logs" | "note_detailed_logs", userId: string, from: string, to: string) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("logged_date", from)
    .lte("logged_date", to);
  if (error) throw error;
  return count ?? 0;
}

const localDate = (timestamp: string) => format(new Date(timestamp), "yyyy-MM-dd");

// Registros de un rango, salvo peinados/outfits/zapatos, que salen del
// historial (ver fetchIdentityHistory) para no pedirlos dos veces.
type BaseRangeData = Omit<RangeData, "hairstyles" | "outfits" | "shoes">;

async function fetchRange(userId: string, from: string, to: string): Promise<BaseRangeData> {
  const nowIso = new Date().toISOString();
  const [moods, meals, exercises, faceLogs, faceProducts, hygieneLogs, social, extras, quickTastes, detailedTastes, notesShort, notesLong] =
    await Promise.all([
      fetchAll((a, b) =>
        supabase.from("wellness_mood").select("mood_date, mood").eq("user_id", userId)
          .gte("mood_date", from).lte("mood_date", to).order("mood_date").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("wellness_meals").select("meal_date, category").eq("user_id", userId)
          .gte("meal_date", from).lte("meal_date", to).order("meal_date").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("wellness_exercise").select("exercise_date, exercise_type").eq("user_id", userId)
          .gte("exercise_date", from).lte("exercise_date", to).order("exercise_date").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("face_logs").select("face_date").eq("user_id", userId).eq("wore_makeup", true)
          .gte("face_date", from).lte("face_date", to).order("face_date").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("face_products").select("created_at, category").eq("user_id", userId)
          .gte("created_at", `${from}T00:00:00`).lte("created_at", `${to}T23:59:59.999`).order("created_at").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("hygiene_logs").select("hygiene_item_id, log_date").eq("user_id", userId).eq("completed", true)
          .gte("log_date", from).lte("log_date", to).order("log_date").range(a, b)
      ),
      // Solo actividades que ya pasaron: las agendadas a futuro todavía no
      // son un registro.
      fetchAll((a, b) =>
        supabase.from("social_activities").select("scheduled_at, activity_type").eq("user_id", userId)
          .gte("scheduled_at", `${from}T00:00:00`).lte("scheduled_at", `${to}T23:59:59.999`)
          .lte("scheduled_at", nowIso).order("scheduled_at").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("expense_detailed_logs").select("expense_date").eq("user_id", userId).eq("expense_kind", "extra")
          .gte("expense_date", from).lte("expense_date", to).order("expense_date").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("taste_quick_logs").select("logged_date, name, rating").eq("user_id", userId)
          .gte("logged_date", from).lte("logged_date", to).order("logged_date").range(a, b)
      ),
      fetchAll((a, b) =>
        supabase.from("taste_detailed_logs").select("logged_date, name, rating, category").eq("user_id", userId)
          .gte("logged_date", from).lte("logged_date", to).order("logged_date").range(a, b)
      ),
      countRows("note_quick_logs", userId, from, to),
      countRows("note_detailed_logs", userId, from, to),
    ]);

  return {
    moods: moods.map((m) => ({ date: m.mood_date, mood: m.mood })),
    meals: meals.map((m) => ({ date: m.meal_date, category: m.category })),
    exercises: exercises.map((e) => ({ date: e.exercise_date, type: e.exercise_type })),
    makeupDates: faceLogs.map((f) => f.face_date),
    faceProducts: faceProducts.map((p) => ({ date: localDate(p.created_at), category: p.category })),
    hygieneLogs: hygieneLogs.map((l) => ({ itemId: l.hygiene_item_id, date: l.log_date })),
    social: social.map((s) => ({ date: localDate(s.scheduled_at), type: s.activity_type })),
    extraExpenses: extras.map((e) => ({ date: e.expense_date })),
    tastes: [
      ...quickTastes.map((t) => ({ date: t.logged_date, name: t.name, rating: t.rating, category: "rapido" })),
      ...detailedTastes.map((t) => ({ date: t.logged_date, name: t.name, rating: t.rating, category: t.category })),
    ],
    notesShort,
    notesLong,
  };
}

interface WardrobeRow {
  id: string;
  date: string;
  text: string;
  colorText: string;
}

const joinText = (...parts: (string | null)[]) => parts.filter((p) => p && p.trim()).join(" ");

// Todo el historial de peinados, outfits y zapatos hasta `to`: hace falta
// para saber si algo es nuevo o se repite.
async function fetchIdentityHistory(userId: string, to: string) {
  const [hairstyles, outfits, shoes] = await Promise.all([
    fetchAll((a, b) =>
      supabase.from("hairstyle_logs").select("style_date, hairstyle").eq("user_id", userId)
        .lte("style_date", to).order("style_date").range(a, b)
    ),
    fetchAll((a, b) =>
      supabase.from("outfit_logs")
        .select("id, outfit_date, description, clothing_type, main_colors, accessories_description")
        .eq("user_id", userId).lte("outfit_date", to).order("outfit_date").range(a, b)
    ),
    fetchAll((a, b) =>
      supabase.from("shoe_logs").select("id, shoe_date, description, shoe_type, brand, color")
        .eq("user_id", userId).lte("shoe_date", to).order("shoe_date").range(a, b)
    ),
  ]);

  return {
    hairstyles: hairstyles.map((h) => ({ date: h.style_date, name: h.hairstyle })),
    // Un outfit se identifica por su descripción; si no tiene, por tipo de
    // prenda + colores.
    outfits: outfits.map<WardrobeRow>((o) => ({
      id: o.id,
      date: o.outfit_date,
      text: o.description?.trim() || joinText(o.clothing_type, o.main_colors),
      colorText: joinText(o.main_colors, o.description, o.accessories_description),
    })),
    // Unos zapatos se identifican por tipo + marca + color; si no hay nada
    // de eso, por la descripción.
    shoes: shoes.map<WardrobeRow>((s) => ({
      id: s.id,
      date: s.shoe_date,
      text: joinText(s.shoe_type === "otro" ? null : s.shoe_type, s.brand, s.color) || s.description?.trim() || "",
      colorText: joinText(s.color, s.description),
    })),
  };
}

function sliceRange(
  base: BaseRangeData,
  history: Awaited<ReturnType<typeof fetchIdentityHistory>>,
  period: Period
): RangeData {
  const inside = (date: string) => date >= period.from && date <= period.to;
  return {
    ...base,
    hairstyles: history.hairstyles.filter((h) => inside(h.date)),
    outfits: history.outfits.filter((o) => inside(o.date)),
    shoes: history.shoes.filter((s) => inside(s.date)),
  };
}

export async function fetchReport(userId: string, period: Period, now: Date = new Date()): Promise<Report> {
  // "Hoy" muestra solo lo registrado; no compara contra ayer.
  const comparison = period.kind === "day" ? null : comparisonPeriod(period, now);

  const [current, previous, history, itemsRes] = await Promise.all([
    fetchRange(userId, period.from, period.to),
    comparison ? fetchRange(userId, comparison.from, comparison.to) : Promise.resolve(null),
    fetchIdentityHistory(userId, period.to),
    supabase
      .from("hygiene_items")
      .select("id, label")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order"),
  ]);
  if (itemsRes.error) throw itemsRes.error;

  const identity: IdentityHistory = {
    hairstyles: history.hairstyles,
    outfits: history.outfits,
    shoes: history.shoes,
  };

  return buildReport({
    period,
    current: sliceRange(current, history, period),
    previous: previous && comparison ? sliceRange(previous, history, comparison) : null,
    history: identity,
    hygieneItems: itemsRes.data ?? [],
  });
}

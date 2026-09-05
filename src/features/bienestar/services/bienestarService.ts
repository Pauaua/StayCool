import { eachDayOfInterval, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import type { MealCategory, Mood } from "@/features/bienestar/types";
import type { DailyWellnessStat } from "@/features/bienestar/types";

const PAGE_SIZE = 20;

export async function logMeal(userId: string, description: string, category?: MealCategory) {
  const { error } = await supabase
    .from("wellness_meals")
    .insert({ user_id: userId, description, category: category ?? null });
  if (error) throw error;
}

export async function logSleep(userId: string, sleptAt: string, wokeAt: string) {
  const { error } = await supabase
    .from("wellness_sleep")
    .insert({ user_id: userId, slept_at: sleptAt, woke_at: wokeAt });
  if (error) throw error;
}

export async function logExercise(userId: string, exerciseType: string, durationMinutes?: number) {
  const { error } = await supabase
    .from("wellness_exercise")
    .insert({ user_id: userId, exercise_type: exerciseType, duration_minutes: durationMinutes ?? null });
  if (error) throw error;
}

export async function upsertMood(userId: string, mood: Mood, energyLevel?: number) {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("wellness_mood").upsert(
    { user_id: userId, mood_date: today, mood, energy_level: energyLevel ?? null },
    { onConflict: "user_id,mood_date" }
  );
  if (error) throw error;
}

// Trae horas de sueño y cantidad de comidas por día en un rango acotado
// (semana o mes visible), para las gráficas — nunca todo el historial.
export async function fetchWellnessStatsRange(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<DailyWellnessStat[]> {
  const [sleepRes, mealsRes] = await Promise.all([
    supabase
      .from("wellness_sleep")
      .select("sleep_date, duration_minutes")
      .eq("user_id", userId)
      .gte("sleep_date", fromDate)
      .lte("sleep_date", toDate),
    supabase
      .from("wellness_meals")
      .select("meal_date")
      .eq("user_id", userId)
      .gte("meal_date", fromDate)
      .lte("meal_date", toDate),
  ]);

  if (sleepRes.error) throw sleepRes.error;
  if (mealsRes.error) throw mealsRes.error;

  const sleepByDate = new Map<string, number>();
  for (const row of sleepRes.data ?? []) {
    sleepByDate.set(row.sleep_date, (sleepByDate.get(row.sleep_date) ?? 0) + row.duration_minutes);
  }

  const mealsByDate = new Map<string, number>();
  for (const row of mealsRes.data ?? []) {
    mealsByDate.set(row.meal_date, (mealsByDate.get(row.meal_date) ?? 0) + 1);
  }

  const days = eachDayOfInterval({ start: new Date(`${fromDate}T00:00:00`), end: new Date(`${toDate}T00:00:00`) });

  return days.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return {
      date: dateKey,
      sleepHours: Math.round(((sleepByDate.get(dateKey) ?? 0) / 60) * 10) / 10,
      mealsCount: mealsByDate.get(dateKey) ?? 0,
    };
  });
}

export async function fetchMealsPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("wellness_meals")
    .select("*")
    .eq("user_id", userId)
    .order("meal_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: data ?? [], nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined };
}

import { supabase } from "@/lib/supabase";

const todayIso = () => new Date().toISOString().slice(0, 10);

export interface TodayStats {
  mealsCount: number;
  exerciseCount: number;
  showered: boolean;
  hygieneCompleted: number;
  hygieneTotal: number;
  hairWashed: boolean;
  hairstyleLogged: boolean;
  outfitLogged: boolean;
  shoesLogged: boolean;
  madeUp: boolean;
  mood: string | null;
  activitiesCount: number;
  expenseTotal: number;
}

// Estadísticas puramente empíricas: solo cuenta lo que la usuaria ya
// registró en el día dado, sin inferir ni comparar contra promedios.
export async function fetchDayStats(userId: string, date: string): Promise<TodayStats> {
  const today = date;

  const [
    mealsRes,
    exerciseRes,
    hygieneItemsRes,
    hygieneLogsRes,
    hairWashRes,
    hairstyleRes,
    outfitRes,
    shoesRes,
    faceRes,
    moodRes,
    activitiesRes,
    quickExpensesRes,
    detailedExpensesRes,
  ] = await Promise.all([
    supabase.from("wellness_meals").select("id").eq("user_id", userId).eq("meal_date", today),
    supabase.from("wellness_exercise").select("id").eq("user_id", userId).eq("exercise_date", today),
    supabase.from("hygiene_items").select("id, label").eq("user_id", userId).eq("is_active", true),
    supabase
      .from("hygiene_logs")
      .select("hygiene_item_id, completed")
      .eq("user_id", userId)
      .eq("log_date", today),
    supabase.from("hair_wash_logs").select("id").eq("user_id", userId).eq("wash_date", today),
    supabase.from("hairstyle_logs").select("id").eq("user_id", userId).eq("style_date", today),
    supabase.from("outfit_logs").select("id").eq("user_id", userId).eq("outfit_date", today),
    supabase.from("shoe_logs").select("id").eq("user_id", userId).eq("shoe_date", today),
    supabase
      .from("face_logs")
      .select("wore_makeup")
      .eq("user_id", userId)
      .eq("face_date", today)
      .maybeSingle(),
    supabase.from("wellness_mood").select("mood").eq("user_id", userId).eq("mood_date", today).maybeSingle(),
    supabase
      .from("social_activities")
      .select("id, scheduled_at")
      .eq("user_id", userId)
      .gte("scheduled_at", `${today}T00:00:00`)
      .lt("scheduled_at", `${today}T23:59:59.999`),
    supabase.from("expense_quick_logs").select("amount").eq("user_id", userId).eq("expense_date", today),
    supabase
      .from("expense_detailed_logs")
      .select("amount")
      .eq("user_id", userId)
      .eq("expense_date", today),
  ]);

  const hygieneItems = hygieneItemsRes.data ?? [];
  const hygieneLogs = hygieneLogsRes.data ?? [];
  const completedIds = new Set(hygieneLogs.filter((l) => l.completed).map((l) => l.hygiene_item_id));
  const showerItemId = hygieneItems.find((i) => i.label.toLowerCase().includes("ducha"))?.id;

  const expenseTotal =
    (quickExpensesRes.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0) +
    (detailedExpensesRes.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    mealsCount: mealsRes.data?.length ?? 0,
    exerciseCount: exerciseRes.data?.length ?? 0,
    showered: showerItemId ? completedIds.has(showerItemId) : false,
    hygieneCompleted: completedIds.size,
    hygieneTotal: hygieneItems.length,
    hairWashed: (hairWashRes.data?.length ?? 0) > 0,
    hairstyleLogged: (hairstyleRes.data?.length ?? 0) > 0,
    outfitLogged: (outfitRes.data?.length ?? 0) > 0,
    shoesLogged: (shoesRes.data?.length ?? 0) > 0,
    madeUp: !!faceRes.data?.wore_makeup,
    mood: moodRes.data?.mood ?? null,
    activitiesCount: activitiesRes.data?.length ?? 0,
    expenseTotal,
  };
}

export function fetchTodayStats(userId: string): Promise<TodayStats> {
  return fetchDayStats(userId, todayIso());
}

// Días dentro del rango que tienen al menos un registro en cualquier
// módulo — para marcar/habilitar esos días en el calendario.
export async function fetchDatesWithDataInMonth(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<Set<string>> {
  const [
    mealsRes,
    exerciseRes,
    hygieneLogsRes,
    hairWashRes,
    hairstyleRes,
    outfitRes,
    shoesRes,
    faceRes,
    moodRes,
    activitiesRes,
    quickExpensesRes,
    detailedExpensesRes,
  ] = await Promise.all([
    supabase
      .from("wellness_meals")
      .select("meal_date")
      .eq("user_id", userId)
      .gte("meal_date", fromDate)
      .lte("meal_date", toDate),
    supabase
      .from("wellness_exercise")
      .select("exercise_date")
      .eq("user_id", userId)
      .gte("exercise_date", fromDate)
      .lte("exercise_date", toDate),
    supabase
      .from("hygiene_logs")
      .select("log_date")
      .eq("user_id", userId)
      .gte("log_date", fromDate)
      .lte("log_date", toDate),
    supabase
      .from("hair_wash_logs")
      .select("wash_date")
      .eq("user_id", userId)
      .gte("wash_date", fromDate)
      .lte("wash_date", toDate),
    supabase
      .from("hairstyle_logs")
      .select("style_date")
      .eq("user_id", userId)
      .gte("style_date", fromDate)
      .lte("style_date", toDate),
    supabase
      .from("outfit_logs")
      .select("outfit_date")
      .eq("user_id", userId)
      .gte("outfit_date", fromDate)
      .lte("outfit_date", toDate),
    supabase
      .from("shoe_logs")
      .select("shoe_date")
      .eq("user_id", userId)
      .gte("shoe_date", fromDate)
      .lte("shoe_date", toDate),
    supabase
      .from("face_logs")
      .select("face_date")
      .eq("user_id", userId)
      .gte("face_date", fromDate)
      .lte("face_date", toDate),
    supabase
      .from("wellness_mood")
      .select("mood_date")
      .eq("user_id", userId)
      .gte("mood_date", fromDate)
      .lte("mood_date", toDate),
    supabase
      .from("social_activities")
      .select("scheduled_at")
      .eq("user_id", userId)
      .gte("scheduled_at", `${fromDate}T00:00:00`)
      .lt("scheduled_at", `${toDate}T23:59:59.999`),
    supabase
      .from("expense_quick_logs")
      .select("expense_date")
      .eq("user_id", userId)
      .gte("expense_date", fromDate)
      .lte("expense_date", toDate),
    supabase
      .from("expense_detailed_logs")
      .select("expense_date")
      .eq("user_id", userId)
      .gte("expense_date", fromDate)
      .lte("expense_date", toDate),
  ]);

  const dates = new Set<string>();
  for (const row of mealsRes.data ?? []) dates.add(row.meal_date);
  for (const row of exerciseRes.data ?? []) dates.add(row.exercise_date);
  for (const row of hygieneLogsRes.data ?? []) dates.add(row.log_date);
  for (const row of hairWashRes.data ?? []) dates.add(row.wash_date);
  for (const row of hairstyleRes.data ?? []) dates.add(row.style_date);
  for (const row of outfitRes.data ?? []) dates.add(row.outfit_date);
  for (const row of shoesRes.data ?? []) dates.add(row.shoe_date);
  for (const row of faceRes.data ?? []) dates.add(row.face_date);
  for (const row of moodRes.data ?? []) dates.add(row.mood_date);
  for (const row of activitiesRes.data ?? []) dates.add(row.scheduled_at.slice(0, 10));
  for (const row of quickExpensesRes.data ?? []) dates.add(row.expense_date);
  for (const row of detailedExpensesRes.data ?? []) dates.add(row.expense_date);

  return dates;
}

export interface PeriodStats {
  mealsCount: number;
  exerciseCount: number;
  hygieneCompletionPercent: number;
  hairWashCount: number;
  hairstyleCount: number;
  makeupDaysCount: number;
  outfitsCount: number;
  shoesCount: number;
  activitiesCount: number;
  expenseTotal: number;
  hasData: boolean;
}

// Mismo espíritu que fetchTodayStats pero agregado sobre un rango de fechas
// (semanal / anual) — solo cuenta lo que la usuaria ya registró, nada de
// datos inventados ni comparaciones.
export async function fetchPeriodStats(userId: string, fromDate: string, toDate: string): Promise<PeriodStats> {
  const [
    mealsRes,
    exerciseRes,
    hygieneLogsRes,
    hairWashRes,
    hairstyleRes,
    outfitRes,
    shoesRes,
    faceRes,
    activitiesRes,
    quickExpensesRes,
    detailedExpensesRes,
  ] = await Promise.all([
    supabase
      .from("wellness_meals")
      .select("id")
      .eq("user_id", userId)
      .gte("meal_date", fromDate)
      .lte("meal_date", toDate),
    supabase
      .from("wellness_exercise")
      .select("id")
      .eq("user_id", userId)
      .gte("exercise_date", fromDate)
      .lte("exercise_date", toDate),
    supabase
      .from("hygiene_logs")
      .select("completed")
      .eq("user_id", userId)
      .gte("log_date", fromDate)
      .lte("log_date", toDate),
    supabase
      .from("hair_wash_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("wash_date", fromDate)
      .lte("wash_date", toDate),
    supabase
      .from("hairstyle_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("style_date", fromDate)
      .lte("style_date", toDate),
    supabase
      .from("outfit_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("outfit_date", fromDate)
      .lte("outfit_date", toDate),
    supabase
      .from("shoe_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("shoe_date", fromDate)
      .lte("shoe_date", toDate),
    supabase
      .from("face_logs")
      .select("wore_makeup")
      .eq("user_id", userId)
      .gte("face_date", fromDate)
      .lte("face_date", toDate),
    supabase
      .from("social_activities")
      .select("id")
      .eq("user_id", userId)
      .gte("scheduled_at", `${fromDate}T00:00:00`)
      .lt("scheduled_at", `${toDate}T23:59:59.999`),
    supabase
      .from("expense_quick_logs")
      .select("amount")
      .eq("user_id", userId)
      .gte("expense_date", fromDate)
      .lte("expense_date", toDate),
    supabase
      .from("expense_detailed_logs")
      .select("amount")
      .eq("user_id", userId)
      .gte("expense_date", fromDate)
      .lte("expense_date", toDate),
  ]);

  const hygieneLogs = hygieneLogsRes.data ?? [];
  const hygieneCompletionPercent =
    hygieneLogs.length > 0
      ? Math.round((hygieneLogs.filter((l) => l.completed).length / hygieneLogs.length) * 100)
      : 0;

  const expenseTotal =
    (quickExpensesRes.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0) +
    (detailedExpensesRes.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const mealsCount = mealsRes.data?.length ?? 0;
  const exerciseCount = exerciseRes.data?.length ?? 0;
  const hairWashCount = hairWashRes.data?.length ?? 0;
  const hairstyleCount = hairstyleRes.data?.length ?? 0;
  const makeupDaysCount = (faceRes.data ?? []).filter((f) => f.wore_makeup).length;
  const outfitsCount = outfitRes.data?.length ?? 0;
  const shoesCount = shoesRes.data?.length ?? 0;
  const activitiesCount = activitiesRes.data?.length ?? 0;

  const hasData =
    mealsCount > 0 ||
    exerciseCount > 0 ||
    hygieneLogs.length > 0 ||
    hairWashCount > 0 ||
    hairstyleCount > 0 ||
    makeupDaysCount > 0 ||
    outfitsCount > 0 ||
    shoesCount > 0 ||
    activitiesCount > 0 ||
    expenseTotal > 0;

  return {
    mealsCount,
    exerciseCount,
    hygieneCompletionPercent,
    hairWashCount,
    hairstyleCount,
    makeupDaysCount,
    outfitsCount,
    shoesCount,
    activitiesCount,
    expenseTotal,
    hasData,
  };
}

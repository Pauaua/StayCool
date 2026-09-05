// Edge Function: resumen
// Agrega datos de los 7 módulos para "Mi Resumen" (Agenda Cool+), calculado
// del lado del servidor para que el cliente no tenga que hacer 10 queries
// ni duplicar lógica de agregación entre la vista in-app, la tarjeta
// compartible y el PDF — los tres consumen exactamente esta misma respuesta.
//
// Requiere plan Básico o Full (gate server-side sobre profiles.premium_tier,
// no confiamos en lo que el cliente diga que es).
//
// Body esperado: { "from": "2026-08-01", "to": "2026-08-31" }
// Requiere header Authorization: Bearer <access_token> del usuario.

import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getServiceClient, getUserFromAuthHeader } from "../_shared/rateLimit.ts";

const MAX_REQUESTS_PER_MINUTE = 20;
const FEELING_SCORE: Record<string, number> = {
  genial: 5,
  bien: 4,
  neutral: 3,
  mal: 2,
  agotado: 1,
};
const FEELING_LABEL_BY_SCORE = ["", "agotado", "mal", "neutral", "bien", "genial"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceClient = getServiceClient();
    const user = await getUserFromAuthHeader(req, serviceClient);
    if (!user) {
      return json({ error: "No autorizado" }, 401);
    }

    const { allowed, remaining } = await checkRateLimit(serviceClient, user.id, "resumen", MAX_REQUESTS_PER_MINUTE);
    if (!allowed) {
      return json({ error: "Demasiadas solicitudes, intenta en un minuto." }, 429);
    }

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("premium_tier, display_name")
      .eq("id", user.id)
      .single();
    if (profileError) throw profileError;
    if (profile.premium_tier === "free") {
      return json({ error: "Mi Resumen requiere el plan Básico o Full." }, 403);
    }

    const { from, to } = await req.json();
    if (!from || !to) {
      return json({ error: "from y to son requeridos (YYYY-MM-DD)" }, 400);
    }

    const days = Math.max(1, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1);
    // Rango inmediatamente anterior, de la misma duración, para poder mostrar
    // "vs. período anterior" en el reporte premium sin que el cliente tenga
    // que pedir/combinar dos resúmenes por su cuenta.
    const prevTo = format(Date.parse(`${from}T00:00:00Z`) - 86400000);
    const prevFrom = format(Date.parse(`${from}T00:00:00Z`) - days * 86400000);

    const [current, previous] = await Promise.all([
      aggregate(serviceClient, user.id, from, to, days),
      aggregate(serviceClient, user.id, prevFrom, prevTo, days),
    ]);

    return json({
      from,
      to,
      displayName: profile.display_name,
      ...current,
      comparison: {
        hygieneCompletionPercentDelta: current.higiene.completionPercent - previous.higiene.completionPercent,
        exerciseCountDelta: current.bienestar.exerciseCount - previous.bienestar.exerciseCount,
        activitiesCountDelta: current.social.activitiesCount - previous.social.activitiesCount,
        gastosTotalDelta: current.gastos.total - previous.gastos.total,
      },
      rateLimitRemaining: remaining,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Error interno" }, 500);
  }
});

function format(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

// deno-lint-ignore no-explicit-any
async function aggregate(serviceClient: any, userId: string, from: string, to: string, days: number) {
  const [
    meals,
    sleep,
    exercise,
    hygieneItems,
    hygieneLogs,
    hairWash,
    hairstyles,
    face,
    outfits,
    social,
    expenseQuick,
    expenseDetailed,
  ] = await Promise.all([
    selectRange(serviceClient, "wellness_meals", "meal_date", userId, from, to, "id"),
    selectRange(serviceClient, "wellness_sleep", "sleep_date", userId, from, to, "duration_minutes"),
    selectRange(serviceClient, "wellness_exercise", "exercise_date", userId, from, to, "id"),
    serviceClient.from("hygiene_items").select("id").eq("user_id", userId).eq("is_active", true),
    selectRange(serviceClient, "hygiene_logs", "log_date", userId, from, to, "completed"),
    selectRange(serviceClient, "hair_wash_logs", "wash_date", userId, from, to, "id"),
    selectRange(serviceClient, "hairstyle_logs", "style_date", userId, from, to, "hairstyle"),
    selectRange(serviceClient, "face_logs", "face_date", userId, from, to, "wore_makeup"),
    selectRange(serviceClient, "outfit_logs", "outfit_date", userId, from, to, "id"),
    serviceClient
      .from("social_activities")
      .select("activity_type, feeling")
      .eq("user_id", userId)
      .gte("scheduled_at", `${from}T00:00:00`)
      .lte("scheduled_at", `${to}T23:59:59`),
    selectRange(serviceClient, "expense_quick_logs", "expense_date", userId, from, to, "expense_type, amount"),
    selectRange(serviceClient, "expense_detailed_logs", "expense_date", userId, from, to, "expense_kind, amount"),
  ]);

  for (const r of [
    meals,
    sleep,
    exercise,
    hygieneItems,
    hygieneLogs,
    hairWash,
    hairstyles,
    face,
    outfits,
    social,
    expenseQuick,
    expenseDetailed,
  ]) {
    if (r.error) throw r.error;
  }

  const activeItemCount = hygieneItems.data?.length ?? 0;
  const completedHygieneLogs = (hygieneLogs.data ?? []).filter((l: { completed: boolean }) => l.completed).length;
  const hygienePossible = activeItemCount * days;
  const hygieneCompletionPercent = hygienePossible > 0 ? Math.round((completedHygieneLogs / hygienePossible) * 100) : 0;

  const sleepDurations = (sleep.data ?? []).map((s: { duration_minutes: number }) => s.duration_minutes);
  const avgSleepMinutes = average(sleepDurations);

  const distinctHairstyles = new Set((hairstyles.data ?? []).map((h: { hairstyle: string }) => h.hairstyle));
  const makeupDays = (face.data ?? []).filter((f: { wore_makeup: boolean }) => f.wore_makeup).length;

  const socialRows = (social.data ?? []) as { activity_type: string; feeling: string | null }[];
  const socialTypeBreakdown: Record<string, number> = {};
  let feelingSum = 0;
  let feelingCount = 0;
  for (const row of socialRows) {
    socialTypeBreakdown[row.activity_type] = (socialTypeBreakdown[row.activity_type] ?? 0) + 1;
    if (row.feeling && FEELING_SCORE[row.feeling]) {
      feelingSum += FEELING_SCORE[row.feeling];
      feelingCount += 1;
    }
  }
  const avgFeelingScore = feelingCount > 0 ? Math.round(feelingSum / feelingCount) : 0;

  const expenseBreakdown: Record<string, number> = {};
  let expenseTotal = 0;
  for (const row of (expenseQuick.data ?? []) as { expense_type: string; amount: number | null }[]) {
    const amount = Number(row.amount ?? 0);
    expenseTotal += amount;
    expenseBreakdown[row.expense_type] = (expenseBreakdown[row.expense_type] ?? 0) + amount;
  }
  for (const row of (expenseDetailed.data ?? []) as { expense_kind: string; amount: number }[]) {
    const amount = Number(row.amount ?? 0);
    expenseTotal += amount;
    expenseBreakdown[row.expense_kind] = (expenseBreakdown[row.expense_kind] ?? 0) + amount;
  }

  return {
    bienestar: {
      avgSleepMinutes,
      mealsCount: meals.data?.length ?? 0,
      exerciseCount: exercise.data?.length ?? 0,
    },
    higiene: {
      completionPercent: hygieneCompletionPercent,
    },
    pelo: {
      washCount: hairWash.data?.length ?? 0,
      distinctHairstylesCount: distinctHairstyles.size,
    },
    cara: {
      makeupDays,
    },
    imagen: {
      outfitsCount: outfits.data?.length ?? 0,
    },
    social: {
      activitiesCount: socialRows.length,
      typeBreakdown: socialTypeBreakdown,
      avgFeelingLabel: FEELING_LABEL_BY_SCORE[avgFeelingScore] || null,
    },
    gastos: {
      total: expenseTotal,
      breakdown: expenseBreakdown,
    },
  };
}

// deno-lint-ignore no-explicit-any
function selectRange(
  client: any,
  table: string,
  dateColumn: string,
  userId: string,
  from: string,
  to: string,
  columns: string
) {
  return client.from(table).select(columns).eq("user_id", userId).gte(dateColumn, from).lte(dateColumn, to);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

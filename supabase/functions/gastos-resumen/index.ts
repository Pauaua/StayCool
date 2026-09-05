// Edge Function: gastos-resumen
// Calcula el resumen de gastos (total + desglose por tipo) del lado del
// servidor para no depender solo del cliente, y para poder cambiar la
// lógica de agregación sin publicar una nueva versión de la app.
//
// Body esperado: { "from": "2026-08-01", "to": "2026-08-31" }
// Requiere header Authorization: Bearer <access_token> del usuario.

import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getServiceClient, getUserFromAuthHeader } from "../_shared/rateLimit.ts";

const MAX_REQUESTS_PER_MINUTE = 20;

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

    const { allowed, remaining } = await checkRateLimit(
      serviceClient,
      user.id,
      "gastos-resumen",
      MAX_REQUESTS_PER_MINUTE
    );
    if (!allowed) {
      return json({ error: "Demasiadas solicitudes, intenta en un minuto." }, 429);
    }

    const { from, to } = await req.json();
    if (!from || !to) {
      return json({ error: "from y to son requeridos (YYYY-MM-DD)" }, 400);
    }

    const [quickResult, detailedResult] = await Promise.all([
      serviceClient
        .from("expense_quick_logs")
        .select("expense_type, amount, expense_date")
        .eq("user_id", user.id)
        .gte("expense_date", from)
        .lte("expense_date", to),
      serviceClient
        .from("expense_detailed_logs")
        .select("expense_kind, amount, expense_date")
        .eq("user_id", user.id)
        .gte("expense_date", from)
        .lte("expense_date", to),
    ]);

    if (quickResult.error) throw quickResult.error;
    if (detailedResult.error) throw detailedResult.error;

    const breakdown: Record<string, number> = {};
    let total = 0;

    for (const row of quickResult.data ?? []) {
      const amount = Number(row.amount ?? 0);
      total += amount;
      breakdown[row.expense_type] = (breakdown[row.expense_type] ?? 0) + amount;
    }

    for (const row of detailedResult.data ?? []) {
      const amount = Number(row.amount ?? 0);
      total += amount;
      breakdown[row.expense_kind] = (breakdown[row.expense_kind] ?? 0) + amount;
    }

    return json({
      from,
      to,
      total,
      breakdown,
      rateLimitRemaining: remaining,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Error interno" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

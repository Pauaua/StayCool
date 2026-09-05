import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

/**
 * Rate limit fijo por ventana de 1 minuto, respaldado en la tabla
 * function_rate_limits (RLS bloqueado para clientes; solo la service role
 * que usan las Edge Functions puede leer/escribir ahí).
 */
export async function checkRateLimit(
  serviceClient: SupabaseClient,
  userId: string,
  functionName: string,
  maxRequestsPerMinute: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setSeconds(0, 0);

  const { data: existing, error: selectError } = await serviceClient
    .from("function_rate_limits")
    .select("request_count")
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  if (selectError) throw selectError;

  const currentCount = existing?.request_count ?? 0;
  if (currentCount >= maxRequestsPerMinute) {
    return { allowed: false, remaining: 0 };
  }

  const { error: upsertError } = await serviceClient
    .from("function_rate_limits")
    .upsert(
      {
        user_id: userId,
        function_name: functionName,
        window_start: windowStart.toISOString(),
        request_count: currentCount + 1,
      },
      { onConflict: "user_id,function_name,window_start" }
    );

  if (upsertError) throw upsertError;

  return { allowed: true, remaining: maxRequestsPerMinute - (currentCount + 1) };
}

export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

export async function getUserFromAuthHeader(
  req: Request,
  serviceClient: SupabaseClient
): Promise<{ id: string } | null> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await serviceClient.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id };
}

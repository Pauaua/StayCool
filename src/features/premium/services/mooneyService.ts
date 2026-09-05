import { supabase } from "@/lib/supabase";

export async function fetchMooneyBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("moo_ney_balance")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.balance ?? 0;
}

export async function fetchMooneyTransactions(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from("moo_ney_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// Re-deriva y otorga MOOney pendiente del día (idempotente, seguro de
// llamar tantas veces como se quiera — ver sync_mooney() en Postgres).
export async function syncMooney() {
  const { data, error } = await supabase.rpc("sync_mooney");
  if (error) throw error;
  return data ?? [];
}

export async function grantMooneyForResumen(periodKey: string) {
  const { data, error } = await supabase.rpc("grant_mooney_for_resumen", { p_period_key: periodKey });
  if (error) throw error;
  return data as number;
}

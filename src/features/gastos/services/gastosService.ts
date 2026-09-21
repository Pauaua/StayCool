import { supabase } from "@/lib/supabase";
import type { DetailedExpense, ExpenseKind, ExpenseSummary, QuickExpense } from "@/features/gastos/types";

const PAGE_SIZE = 20;

export async function createQuickExpense(
  userId: string,
  input: { name: string; expenseType: string; description?: string; amount?: number }
) {
  const { error } = await supabase.from("expense_quick_logs").insert({
    user_id: userId,
    name: input.name,
    expense_type: input.expenseType,
    description: input.description ?? null,
    amount: input.amount ?? null,
  });
  if (error) throw error;
}

// remaining_balance ya no se pide al crear un gasto (queda como columna
// histórica para registros viejos) — el "cuánto te queda" ahora se calcula
// solo, restando del presupuesto mensual (profiles.monthly_budget).
export async function createDetailedExpense(
  userId: string,
  input: {
    itemPurchased: string;
    purpose?: string;
    amount: number;
    expenseKind: ExpenseKind;
    couldWait: boolean;
  }
) {
  const { error } = await supabase.from("expense_detailed_logs").insert({
    user_id: userId,
    item_purchased: input.itemPurchased,
    purpose: input.purpose ?? null,
    amount: input.amount,
    expense_kind: input.expenseKind,
    could_wait: input.couldWait,
  });
  if (error) throw error;
}

export async function fetchQuickExpensesPage(userId: string, page: number): Promise<{ items: QuickExpense[]; nextPage?: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("expense_quick_logs")
    .select("*")
    .eq("user_id", userId)
    .order("expense_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: data ?? [], nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined };
}

export async function fetchDetailedExpensesPage(
  userId: string,
  page: number
): Promise<{ items: DetailedExpense[]; nextPage?: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("expense_detailed_logs")
    .select("*")
    .eq("user_id", userId)
    .order("expense_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    items: (data ?? []) as DetailedExpense[],
    nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined,
  };
}

export async function updateQuickExpense(
  id: string,
  input: { name: string; expenseType: string; description?: string; amount?: number }
) {
  const { error } = await supabase
    .from("expense_quick_logs")
    .update({
      name: input.name,
      expense_type: input.expenseType,
      description: input.description ?? null,
      amount: input.amount ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function updateDetailedExpense(
  id: string,
  input: { itemPurchased: string; purpose?: string; amount: number; expenseKind: ExpenseKind; couldWait: boolean }
) {
  const { error } = await supabase
    .from("expense_detailed_logs")
    .update({
      item_purchased: input.itemPurchased,
      purpose: input.purpose ?? null,
      amount: input.amount,
      expense_kind: input.expenseKind,
      could_wait: input.couldWait,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuickExpense(id: string) {
  const { error } = await supabase.from("expense_quick_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteDetailedExpense(id: string) {
  const { error } = await supabase.from("expense_detailed_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchQuickExpenseById(id: string): Promise<QuickExpense> {
  const { data, error } = await supabase.from("expense_quick_logs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as QuickExpense;
}

export async function fetchDetailedExpenseById(id: string): Promise<DetailedExpense> {
  const { data, error } = await supabase.from("expense_detailed_logs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as DetailedExpense;
}

// El resumen agregado (total + desglose) se calcula en la Edge Function
// "gastos-resumen" para no depender solo del cliente y poder ajustarlo sin
// una nueva build.
export async function fetchExpenseSummary(from: string, to: string): Promise<ExpenseSummary> {
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session.session?.access_token;
  const { data, error } = await supabase.functions.invoke<ExpenseSummary>("gastos-resumen", {
    body: { from, to },
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (error) throw error;
  return data as ExpenseSummary;
}

export { PAGE_SIZE };

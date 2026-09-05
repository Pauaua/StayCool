export type ExpenseKind = "fijo" | "extra" | "hormiga" | "innecesario";

export interface QuickExpense {
  id: string;
  user_id: string;
  expense_date: string;
  name: string;
  expense_type: string;
  description: string | null;
  amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface DetailedExpense {
  id: string;
  user_id: string;
  expense_date: string;
  item_purchased: string;
  purpose: string | null;
  amount: number;
  expense_kind: ExpenseKind;
  could_wait: boolean;
  remaining_balance: number | null;
}

export interface ExpenseSummary {
  from: string;
  to: string;
  total: number;
  breakdown: Record<string, number>;
}

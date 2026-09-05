import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createDetailedExpense,
  createQuickExpense,
  fetchDetailedExpenseById,
  fetchDetailedExpensesPage,
  fetchExpenseSummary,
  fetchQuickExpenseById,
  fetchQuickExpensesPage,
} from "@/features/gastos/services/gastosService";
import { analytics } from "@/analytics/posthog";
import type { ExpenseKind } from "@/features/gastos/types";

export function useQuickExpenses() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useInfiniteQuery({
    queryKey: ["gastos", "quick", userId],
    queryFn: ({ pageParam }) => fetchQuickExpensesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });
}

export function useCreateQuickExpense() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; expenseType: string; description?: string; amount?: number }) =>
      createQuickExpense(userId as string, input),
    onSuccess: () => {
      analytics.track("gasto_rapido_creado");
      queryClient.invalidateQueries({ queryKey: ["gastos", "quick", userId] });
    },
  });
}

export function useDetailedExpenses() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useInfiniteQuery({
    queryKey: ["gastos", "detailed", userId],
    queryFn: ({ pageParam }) => fetchDetailedExpensesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });
}

export function useQuickExpenseDetail(expenseId: string) {
  return useQuery({
    queryKey: ["gastos", "quick-detail", expenseId],
    queryFn: () => fetchQuickExpenseById(expenseId),
  });
}

export function useDetailedExpenseDetail(expenseId: string) {
  return useQuery({
    queryKey: ["gastos", "detailed-detail", expenseId],
    queryFn: () => fetchDetailedExpenseById(expenseId),
  });
}

export function useCreateDetailedExpense() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      itemPurchased: string;
      purpose?: string;
      amount: number;
      expenseKind: ExpenseKind;
      couldWait: boolean;
    }) => createDetailedExpense(userId as string, input),
    onSuccess: () => {
      analytics.track("gasto_detallado_creado");
      queryClient.invalidateQueries({ queryKey: ["gastos", "detailed", userId] });
    },
  });
}

export function useExpenseSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["gastos", "resumen", from, to],
    queryFn: () => fetchExpenseSummary(from, to),
  });
}

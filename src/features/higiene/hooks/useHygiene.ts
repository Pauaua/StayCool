import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createHygieneItem,
  deactivateHygieneItem,
  fetchActiveHygieneItems,
  fetchHygieneHistoryPage,
  fetchLogsForDate,
  toggleHygieneLog,
} from "@/features/higiene/services/hygieneService";
import { analytics } from "@/analytics/posthog";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function useHygieneItems() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["hygiene", "items", userId],
    queryFn: () => fetchActiveHygieneItems(userId as string),
    enabled: !!userId,
  });
}

export function useTodayHygieneLogs(date: string = todayIso()) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["hygiene", "logs", userId, date],
    queryFn: () => fetchLogsForDate(userId as string, date),
    enabled: !!userId,
  });
}

export function useToggleHygieneLog(date: string = todayIso()) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      completed,
      isHairWash,
    }: {
      itemId: string;
      completed: boolean;
      isHairWash?: boolean;
    }) => toggleHygieneLog(userId as string, itemId, date, completed, isHairWash),
    onSuccess: (_data, variables) => {
      analytics.track("hygiene_item_toggled", { completed: variables.completed });
      queryClient.invalidateQueries({ queryKey: ["hygiene", "logs", userId, date] });
      queryClient.invalidateQueries({ queryKey: ["hygiene", "history", userId] });
      if (variables.isHairWash) {
        queryClient.invalidateQueries({ queryKey: ["pelo", "wash", userId] });
      }
    },
  });
}

export function useCreateHygieneItem() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ label, icon }: { label: string; icon?: string }) =>
      createHygieneItem(userId as string, label, icon),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hygiene", "items", userId] }),
  });
}

export function useDeactivateHygieneItem() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deactivateHygieneItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hygiene", "items", userId] }),
  });
}

// Historial paginado (scroll infinito) — nunca trae todo el historial junto.
export function useHygieneHistory() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useInfiniteQuery({
    queryKey: ["hygiene", "history", userId],
    queryFn: ({ pageParam }) => fetchHygieneHistoryPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });
}

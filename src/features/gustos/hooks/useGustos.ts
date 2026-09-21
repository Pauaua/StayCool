import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createDetailedTaste,
  createQuickTaste,
  deleteDetailedTaste,
  deleteQuickTaste,
  fetchDetailedTastesPage,
  fetchQuickTastesPage,
  updateDetailedTaste,
  updateQuickTaste,
} from "@/features/gustos/services/gustosService";
import { analytics } from "@/analytics/posthog";
import type { TasteCategory, TasteDetails } from "@/features/gustos/types";

function useUserId() {
  const { session } = useAuth();
  return session?.user.id;
}

export function useQuickTastes() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["gustos", "quick", userId],
    queryFn: ({ pageParam }) => fetchQuickTastesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useCreateQuickTaste() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; rating?: number }) =>
      createQuickTaste(userId as string, input),
    onSuccess: () => {
      analytics.track("gusto_rapido_creado");
      queryClient.invalidateQueries({ queryKey: ["gustos", "quick", userId] });
    },
  });
}

export function useUpdateQuickTaste() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, description, rating }: { id: string; name: string; description?: string; rating?: number }) =>
      updateQuickTaste(id, { name, description, rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gustos", "quick", userId] });
    },
  });
}

export function useDeleteQuickTaste() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuickTaste(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gustos", "quick", userId] });
    },
  });
}

export function useDetailedTastes() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["gustos", "detailed", userId],
    queryFn: ({ pageParam }) => fetchDetailedTastesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useCreateDetailedTaste() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      category: TasteCategory;
      name: string;
      genre?: string;
      notes?: string;
      details: TasteDetails;
      rating?: number;
    }) => createDetailedTaste(userId as string, input),
    onSuccess: () => {
      analytics.track("gusto_detallado_creado");
      queryClient.invalidateQueries({ queryKey: ["gustos", "detailed", userId] });
    },
  });
}

export function useUpdateDetailedTaste() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      category: TasteCategory;
      name: string;
      genre?: string;
      notes?: string;
      details: TasteDetails;
      rating?: number;
    }) => updateDetailedTaste(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gustos", "detailed", userId] });
    },
  });
}

export function useDeleteDetailedTaste() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDetailedTaste(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gustos", "detailed", userId] });
    },
  });
}

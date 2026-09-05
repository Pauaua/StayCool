import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createDetailedNote,
  createQuickNote,
  fetchDetailedNotesPage,
  fetchQuickNotesPage,
} from "@/features/notas/services/notasService";
import { analytics } from "@/analytics/posthog";

function useUserId() {
  const { session } = useAuth();
  return session?.user.id;
}

export function useQuickNotes() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["notas", "quick", userId],
    queryFn: ({ pageParam }) => fetchQuickNotesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useCreateQuickNote() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; feeling?: string }) =>
      createQuickNote(userId as string, input),
    onSuccess: () => {
      analytics.track("nota_rapida_creada");
      queryClient.invalidateQueries({ queryKey: ["notas", "quick", userId] });
    },
  });
}

export function useDetailedNotes() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["notas", "detailed", userId],
    queryFn: ({ pageParam }) => fetchDetailedNotesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useCreateDetailedNote() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; location?: string; idea: string; feelings?: string; thoughts?: string }) =>
      createDetailedNote(userId as string, input),
    onSuccess: () => {
      analytics.track("nota_detallada_creada");
      queryClient.invalidateQueries({ queryKey: ["notas", "detailed", userId] });
    },
  });
}

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchMealsPage,
  fetchWellnessStatsRange,
  logExercise,
  logMeal,
  logSleep,
  upsertMood,
} from "@/features/bienestar/services/bienestarService";
import { analytics } from "@/analytics/posthog";
import type { MealCategory, Mood } from "@/features/bienestar/types";

function useUserId() {
  const { session } = useAuth();
  return session?.user.id;
}

export function useMeals() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["bienestar", "meals", userId],
    queryFn: ({ pageParam }) => fetchMealsPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useLogMeal() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ description, category }: { description: string; category?: MealCategory }) =>
      logMeal(userId as string, description, category),
    onSuccess: () => {
      analytics.track("comida_registrada");
      queryClient.invalidateQueries({ queryKey: ["bienestar", "meals", userId] });
      queryClient.invalidateQueries({ queryKey: ["bienestar", "stats", userId] });
    },
  });
}

export function useLogSleep() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sleptAt, wokeAt }: { sleptAt: string; wokeAt: string }) =>
      logSleep(userId as string, sleptAt, wokeAt),
    onSuccess: () => {
      analytics.track("sueno_registrado");
      queryClient.invalidateQueries({ queryKey: ["bienestar", "stats", userId] });
    },
  });
}

// Estadísticas de un rango de fechas (semana o mes) para las gráficas.
export function useWellnessStats(fromDate: string, toDate: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: ["bienestar", "stats", userId, fromDate, toDate],
    queryFn: () => fetchWellnessStatsRange(userId as string, fromDate, toDate),
    enabled: !!userId,
  });
}

export function useLogExercise() {
  const userId = useUserId();
  return useMutation({
    mutationFn: ({ exerciseType, durationMinutes }: { exerciseType: string; durationMinutes?: number }) =>
      logExercise(userId as string, exerciseType, durationMinutes),
    onSuccess: () => analytics.track("ejercicio_registrado"),
  });
}

export function useUpsertMood() {
  const userId = useUserId();
  return useMutation({
    mutationFn: ({ mood, energyLevel }: { mood: Mood; energyLevel?: number }) =>
      upsertMood(userId as string, mood, energyLevel),
    onSuccess: () => analytics.track("animo_registrado"),
  });
}

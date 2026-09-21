import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  deleteExercise,
  deleteMeal,
  deleteMood,
  fetchExerciseHistory,
  fetchMealsPage,
  fetchMoodHistory,
  fetchWellnessStatsRange,
  logExercise,
  logMeal,
  logSleep,
  updateExercise,
  updateMeal,
  updateMood,
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
    mutationFn: ({
      description,
      category,
      rating,
    }: {
      description: string;
      category?: MealCategory;
      rating?: number;
    }) => logMeal(userId as string, description, category, rating),
    onSuccess: () => {
      analytics.track("comida_registrada");
      queryClient.invalidateQueries({ queryKey: ["bienestar", "meals", userId] });
      queryClient.invalidateQueries({ queryKey: ["bienestar", "stats", userId] });
    },
  });
}

export function useUpdateMeal() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      description,
      category,
      rating,
    }: {
      id: string;
      description: string;
      category?: MealCategory;
      rating?: number;
    }) => updateMeal(userId as string, id, { description, category, rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bienestar", "meals", userId] });
      queryClient.invalidateQueries({ queryKey: ["bienestar", "stats", userId] });
    },
  });
}

export function useDeleteMeal() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMeal(userId as string, id),
    onSuccess: () => {
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

export function useExerciseHistory() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["bienestar", "exercise-history", userId],
    queryFn: () => fetchExerciseHistory(userId as string),
    enabled: !!userId,
  });
}

export function useLogExercise() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      exerciseType,
      durationMinutes,
      sets,
      weightKg,
    }: {
      exerciseType: string;
      durationMinutes?: number;
      sets?: number;
      weightKg?: number;
    }) => logExercise(userId as string, exerciseType, durationMinutes, sets, weightKg),
    onSuccess: () => {
      analytics.track("ejercicio_registrado");
      queryClient.invalidateQueries({ queryKey: ["bienestar", "exercise-history", userId] });
    },
  });
}

export function useUpdateExercise() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      exerciseType,
      durationMinutes,
      sets,
      weightKg,
    }: {
      id: string;
      exerciseType: string;
      durationMinutes?: number;
      sets?: number;
      weightKg?: number;
    }) => updateExercise(userId as string, id, { exerciseType, durationMinutes, sets, weightKg }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bienestar", "exercise-history", userId] });
    },
  });
}

export function useDeleteExercise() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(userId as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bienestar", "exercise-history", userId] });
    },
  });
}

export function useMoodHistory() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["bienestar", "mood-history", userId],
    queryFn: () => fetchMoodHistory(userId as string),
    enabled: !!userId,
  });
}

export function useUpsertMood() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mood, note, energyLevel }: { mood: Mood; note?: string; energyLevel?: number }) =>
      upsertMood(userId as string, mood, note, energyLevel),
    onSuccess: () => {
      analytics.track("animo_registrado");
      queryClient.invalidateQueries({ queryKey: ["bienestar", "mood-history", userId] });
    },
  });
}

export function useUpdateMood() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mood, note }: { id: string; mood: Mood; note?: string }) =>
      updateMood(userId as string, id, { mood, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bienestar", "mood-history", userId] });
    },
  });
}

export function useDeleteMood() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMood(userId as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bienestar", "mood-history", userId] });
    },
  });
}

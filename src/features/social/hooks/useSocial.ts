import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMonths, startOfDay, startOfMonth } from "date-fns";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createActivity,
  deleteActivity,
  fetchActivitiesInRange,
  fetchActivitiesPage,
  linkNextActivity,
  updateActivity,
} from "@/features/social/services/socialService";
import { analytics } from "@/analytics/posthog";
import type { ActivityType, Feeling } from "@/features/social/types";

export function useSocialActivities() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useInfiniteQuery({
    queryKey: ["social", "activities", userId],
    queryFn: ({ pageParam }) => fetchActivitiesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });
}

// Actividades del mes visible en el calendario, usadas tanto para pintar
// los puntos de días con actividad como para listar el detalle del día
// seleccionado (sin traer todo el historial completo del usuario).
export function useActivitiesInMonth(monthAnchor: Date) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const from = startOfMonth(monthAnchor).toISOString();
  const to = addMonths(startOfMonth(monthAnchor), 1).toISOString();

  return useQuery({
    queryKey: ["social", "activities", "month", userId, from],
    queryFn: () => fetchActivitiesInRange(userId as string, from, to),
    enabled: !!userId,
  });
}

// Actividades de hoy + el resto del mes en curso (no el mes que esté
// visible en el calendario, sino el mes real de "hoy"), para el resumen
// debajo del calendario.
export function useUpcomingActivities() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const from = startOfDay(new Date()).toISOString();
  const to = addMonths(startOfMonth(new Date()), 1).toISOString();

  return useQuery({
    queryKey: ["social", "activities", "upcoming", userId, from],
    queryFn: () => fetchActivitiesInRange(userId as string, from, to),
    enabled: !!userId,
  });
}

export function useCreateActivity() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      activityType: ActivityType;
      title?: string;
      companions?: string;
      activityDescription?: string;
      scheduledAt: string;
      isPast: boolean;
      feeling?: Feeling;
    }) => createActivity(userId as string, input),
    onSuccess: () => {
      analytics.track("actividad_social_creada");
      queryClient.invalidateQueries({ queryKey: ["social", "activities", userId] });
    },
  });
}

export function useUpdateActivity() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      activityId,
      input,
    }: {
      activityId: string;
      input: {
        activityType: ActivityType;
        title?: string;
        companions?: string;
        activityDescription?: string;
        scheduledAt: string;
        isPast: boolean;
        feeling?: Feeling;
      };
    }) => updateActivity(activityId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "activities", userId] });
    },
  });
}

export function useDeleteActivity() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "activities", userId] });
    },
  });
}

export function useLinkNextActivity() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: ({ activityId, nextActivityId }: { activityId: string; nextActivityId: string }) =>
      linkNextActivity(activityId, nextActivityId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["social", "activities", session?.user.id] }),
  });
}

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  deleteHairstyleLog,
  deleteHairWashLog,
  fetchHairProfile,
  fetchHairstyleById,
  fetchHairstylesPage,
  fetchHairWashHistoryPage,
  getHairstylePhotoUrl,
  logHairstyle,
  updateHairstyleLog,
  updateHairWashLog,
  upsertHairProfile,
} from "@/features/pelo/services/peloService";
import { analytics } from "@/analytics/posthog";
import type { HairProfile, HairstyleType } from "@/features/pelo/types";

function useUserId() {
  const { session } = useAuth();
  return session?.user.id;
}

export function useHairWashHistory() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["pelo", "wash", userId],
    queryFn: ({ pageParam }) => fetchHairWashHistoryPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useHairstyles() {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: ["pelo", "hairstyles", userId],
    queryFn: ({ pageParam }) => fetchHairstylesPage(userId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    enabled: !!userId,
  });
}

export function useHairstyleDetail(hairstyleId: string) {
  const hairstyleQuery = useQuery({
    queryKey: ["pelo", "hairstyle", hairstyleId],
    queryFn: () => fetchHairstyleById(hairstyleId),
  });

  const photoUrlQuery = useQuery({
    queryKey: ["pelo", "hairstyle-photo-url", hairstyleQuery.data?.photo_path],
    queryFn: () => getHairstylePhotoUrl(hairstyleQuery.data?.photo_path as string),
    enabled: !!hairstyleQuery.data?.photo_path,
  });

  return {
    hairstyle: hairstyleQuery.data,
    photoUrl: photoUrlQuery.data,
    isLoading: hairstyleQuery.isLoading,
  };
}

export function useUpdateHairstyle() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      hairstyle,
      localImageUri,
      styleType,
      isSpecialOccasion,
      occasionDetails,
    }: {
      id: string;
      hairstyle: string;
      localImageUri?: string;
      styleType?: HairstyleType;
      isSpecialOccasion?: boolean;
      occasionDetails?: string;
    }) =>
      updateHairstyleLog(id, userId as string, hairstyle, localImageUri, {
        styleType,
        isSpecialOccasion,
        occasionDetails,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pelo", "hairstyles", userId] });
      queryClient.invalidateQueries({ queryKey: ["pelo", "hairstyle", variables.id] });
    },
  });
}

export function useDeleteHairstyle() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHairstyleLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelo", "hairstyles", userId] });
    },
  });
}

export function useDeleteHairWash() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHairWashLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelo", "wash", userId] });
    },
  });
}

export function useUpdateHairWash() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, washedAt }: { id: string; washedAt: Date }) => updateHairWashLog(id, washedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelo", "wash", userId] });
    },
  });
}

export function useHairProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["pelo", "profile", userId],
    queryFn: () => fetchHairProfile(userId as string),
    enabled: !!userId,
  });
}

export function useSaveHairProfile() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HairProfile) => upsertHairProfile(userId as string, input),
    onSuccess: () => {
      analytics.track("perfil_cabello_actualizado");
      queryClient.invalidateQueries({ queryKey: ["pelo", "profile", userId] });
    },
  });
}

export function useLogHairstyle() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hairstyle,
      localImageUri,
      styleType,
      isSpecialOccasion,
      occasionDetails,
    }: {
      hairstyle: string;
      localImageUri?: string;
      styleType?: HairstyleType;
      isSpecialOccasion?: boolean;
      occasionDetails?: string;
    }) =>
      logHairstyle(userId as string, hairstyle, localImageUri, {
        styleType,
        isSpecialOccasion,
        occasionDetails,
      }),
    onSuccess: () => {
      analytics.track("peinado_registrado");
      queryClient.invalidateQueries({ queryKey: ["pelo", "hairstyles", userId] });
    },
  });
}

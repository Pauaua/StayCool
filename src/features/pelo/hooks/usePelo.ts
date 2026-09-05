import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchHairProfile,
  fetchHairstyleById,
  fetchHairstylesPage,
  fetchHairWashHistoryPage,
  getHairstylePhotoUrl,
  logHairstyle,
  upsertHairProfile,
} from "@/features/pelo/services/peloService";
import { analytics } from "@/analytics/posthog";
import type { HairProfile } from "@/features/pelo/types";

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
    mutationFn: ({ hairstyle, localImageUri }: { hairstyle: string; localImageUri?: string }) =>
      logHairstyle(userId as string, hairstyle, localImageUri),
    onSuccess: () => {
      analytics.track("peinado_registrado");
      queryClient.invalidateQueries({ queryKey: ["pelo", "hairstyles", userId] });
    },
  });
}

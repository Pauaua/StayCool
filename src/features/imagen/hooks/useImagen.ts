import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchOutfitById,
  fetchShoeById,
  fetchWeekFaceLogs,
  fetchWeekOutfits,
  fetchWeekShoes,
  getOutfitPhotoUrl,
  getShoePhotoUrl,
  saveOutfitLog,
  saveShoeLog,
  upsertFaceLog,
} from "@/features/imagen/services/imagenService";
import { analytics } from "@/analytics/posthog";

function useUserId() {
  const { session } = useAuth();
  return session?.user.id;
}

function useWeekRange() {
  const now = new Date();
  return {
    from: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    to: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

// -------- Vestuario --------

export function useWeekOutfits() {
  const userId = useUserId();
  const { from, to } = useWeekRange();
  return useQuery({
    queryKey: ["imagen", "outfits", userId, from, to],
    queryFn: () => fetchWeekOutfits(userId as string, from, to),
    enabled: !!userId,
  });
}

export function useOutfitDetail(outfitId: string) {
  const outfitQuery = useQuery({
    queryKey: ["imagen", "outfit", outfitId],
    queryFn: () => fetchOutfitById(outfitId),
  });
  const photoUrlQuery = useQuery({
    queryKey: ["imagen", "outfit-photo-url", outfitQuery.data?.photo_path],
    queryFn: () => getOutfitPhotoUrl(outfitQuery.data?.photo_path as string),
    enabled: !!outfitQuery.data?.photo_path,
  });
  return { outfit: outfitQuery.data, photoUrl: photoUrlQuery.data, isLoading: outfitQuery.isLoading };
}

export function useSaveOutfit() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, description, localImageUri }: { date: string; description: string; localImageUri?: string }) =>
      saveOutfitLog(userId as string, date, description, localImageUri),
    onSuccess: () => {
      analytics.track("outfit_registrado");
      queryClient.invalidateQueries({ queryKey: ["imagen", "outfits", userId] });
    },
  });
}

// -------- Zapatos --------

export function useWeekShoes() {
  const userId = useUserId();
  const { from, to } = useWeekRange();
  return useQuery({
    queryKey: ["imagen", "shoes", userId, from, to],
    queryFn: () => fetchWeekShoes(userId as string, from, to),
    enabled: !!userId,
  });
}

export function useShoeDetail(shoeId: string) {
  const shoeQuery = useQuery({
    queryKey: ["imagen", "shoe", shoeId],
    queryFn: () => fetchShoeById(shoeId),
  });
  const photoUrlQuery = useQuery({
    queryKey: ["imagen", "shoe-photo-url", shoeQuery.data?.photo_path],
    queryFn: () => getShoePhotoUrl(shoeQuery.data?.photo_path as string),
    enabled: !!shoeQuery.data?.photo_path,
  });
  return { shoe: shoeQuery.data, photoUrl: photoUrlQuery.data, isLoading: shoeQuery.isLoading };
}

export function useSaveShoe() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, description, localImageUri }: { date: string; description: string; localImageUri?: string }) =>
      saveShoeLog(userId as string, date, description, localImageUri),
    onSuccess: () => {
      analytics.track("zapatos_registrados");
      queryClient.invalidateQueries({ queryKey: ["imagen", "shoes", userId] });
    },
  });
}

// -------- Cara (maquillaje) --------

export function useWeekFaceLogs() {
  const userId = useUserId();
  const from = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  return useQuery({
    queryKey: ["imagen", "cara", "week", userId],
    queryFn: () => fetchWeekFaceLogs(userId as string, from),
    enabled: !!userId,
  });
}

export function useUpsertFaceLog() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { woreMakeup: boolean }) => upsertFaceLog(userId as string, input),
    onSuccess: () => {
      analytics.track("cara_registrada");
      queryClient.invalidateQueries({ queryKey: ["imagen", "cara", "week", userId] });
    },
  });
}

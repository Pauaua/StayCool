import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  equipStarterPiece,
  fetchAvatarSelection,
  fetchUnlockedPieceIds,
  purchaseAndEquipPiece,
} from "@/features/premium/services/avatarService";
import type { AvatarCategory } from "@/features/premium/avatar/types";

export function useAvatarSelection() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["avatar-selection", userId],
    queryFn: () => fetchAvatarSelection(userId as string),
    enabled: !!userId,
  });
}

export function useUnlockedPieces() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["avatar-unlocked", userId],
    queryFn: () => fetchUnlockedPieceIds(userId as string),
    enabled: !!userId,
  });
}

function invalidateAvatarQueries(queryClient: ReturnType<typeof useQueryClient>, userId?: string) {
  queryClient.invalidateQueries({ queryKey: ["avatar-selection", userId] });
  queryClient.invalidateQueries({ queryKey: ["avatar-unlocked", userId] });
  queryClient.invalidateQueries({ queryKey: ["mooney-balance", userId] });
  queryClient.invalidateQueries({ queryKey: ["mooney-transactions", userId] });
}

export function useEquipStarterPiece() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, pieceId }: { category: AvatarCategory; pieceId: string }) =>
      equipStarterPiece(userId as string, category, pieceId),
    onSuccess: () => invalidateAvatarQueries(queryClient, userId),
  });
}

export function usePurchaseAvatarPiece() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, pieceId, cost }: { category: AvatarCategory; pieceId: string; cost: number }) =>
      purchaseAndEquipPiece(category, pieceId, cost),
    onSuccess: () => invalidateAvatarQueries(queryClient, userId),
  });
}

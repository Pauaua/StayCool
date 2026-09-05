import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePremium } from "@/features/premium/hooks/usePremium";
import {
  fetchMooneyBalance,
  fetchMooneyTransactions,
  syncMooney,
} from "@/features/premium/services/mooneyService";

export function useMooneyBalance() {
  const { session } = useAuth();
  const { isFull } = usePremium();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["mooney-balance", userId],
    queryFn: () => fetchMooneyBalance(userId as string),
    enabled: !!userId && isFull,
  });
}

export function useMooneyTransactions() {
  const { session } = useAuth();
  const { isFull } = usePremium();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["mooney-transactions", userId],
    queryFn: () => fetchMooneyTransactions(userId as string),
    enabled: !!userId && isFull,
  });
}

// Llamar tras cualquier registro exitoso en un módulo (o al abrir el perfil)
// para que el saldo/racha se pongan al día. No pasa nada si se llama de más:
// sync_mooney() es idempotente.
export function useSyncMooney() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { isFull } = usePremium();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: syncMooney,
    onSuccess: (granted) => {
      if (!isFull) return;
      queryClient.invalidateQueries({ queryKey: ["mooney-balance", userId] });
      if (granted.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["mooney-transactions", userId] });
      }
    },
  });
}

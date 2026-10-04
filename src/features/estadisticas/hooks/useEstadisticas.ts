import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchReport } from "@/features/estadisticas/services/estadisticasService";
import type { Period } from "@/features/estadisticas/logic/periods";

export function useReport(period: Period) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["estadisticas", "report", userId, period.kind, period.from, period.to],
    queryFn: () => fetchReport(userId as string, period),
    enabled: !!userId,
  });
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchResumen, getPeriodKey } from "@/features/resumen/services/resumenService";
import type { ResumenPeriod } from "@/features/resumen/types";

export function useResumenPeriod(initial: ResumenPeriod = "monthly") {
  const [period, setPeriod] = useState<ResumenPeriod>(initial);
  return { period, setPeriod };
}

export function useResumenData(period: ResumenPeriod) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["resumen", userId, period],
    queryFn: () => fetchResumen(period),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useResumenPeriodKey(period: ResumenPeriod) {
  return getPeriodKey(period);
}

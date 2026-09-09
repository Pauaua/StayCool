import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, addMonths } from "date-fns";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchDatesWithDataInMonth,
  fetchDayStats,
  fetchPeriodStats,
  fetchTodayStats,
} from "@/features/estadisticas/services/estadisticasService";

export function useTodayStats() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["estadisticas", "today", userId],
    queryFn: () => fetchTodayStats(userId as string),
    enabled: !!userId,
  });
}

export function useDayStats(date: string | null) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["estadisticas", "day", userId, date],
    queryFn: () => fetchDayStats(userId as string, date as string),
    enabled: !!userId && !!date,
  });
}

export function usePeriodStats(fromDate: string, toDate: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["estadisticas", "period", userId, fromDate, toDate],
    queryFn: () => fetchPeriodStats(userId as string, fromDate, toDate),
    enabled: !!userId,
  });
}

export function useMonthDataDates(monthAnchor: Date) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const from = format(startOfMonth(monthAnchor), "yyyy-MM-dd");
  const to = format(addMonths(startOfMonth(monthAnchor), 1), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["estadisticas", "month-dates", userId, from],
    queryFn: () => fetchDatesWithDataInMonth(userId as string, from, to),
    enabled: !!userId,
  });
}

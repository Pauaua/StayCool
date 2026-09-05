import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/hooks/useAuth";

const todayIso = () => new Date().toISOString().slice(0, 10);

interface DashboardSummary {
  pendingHygieneItems: number;
  totalHygieneItems: number;
  nextActivity: { title: string | null; scheduled_at: string } | null;
  todayExpenseTotal: number;
  needsMakeupRemoval: boolean;
}

async function fetchDashboardSummary(userId: string): Promise<DashboardSummary> {
  const today = todayIso();

  const [itemsRes, logsRes, activityRes, expensesRes, faceRes] = await Promise.all([
    supabase.from("hygiene_items").select("id").eq("user_id", userId).eq("is_active", true),
    supabase
      .from("hygiene_logs")
      .select("hygiene_item_id, completed")
      .eq("user_id", userId)
      .eq("log_date", today),
    supabase
      .from("social_activities")
      .select("title, scheduled_at")
      .eq("user_id", userId)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("expense_quick_logs")
      .select("amount")
      .eq("user_id", userId)
      .eq("expense_date", today),
    supabase
      .from("face_logs")
      .select("wore_makeup, removed_makeup")
      .eq("user_id", userId)
      .eq("face_date", today)
      .maybeSingle(),
  ]);

  const totalHygieneItems = itemsRes.data?.length ?? 0;
  const completedIds = new Set(
    (logsRes.data ?? []).filter((l) => l.completed).map((l) => l.hygiene_item_id)
  );

  const todayExpenseTotal = (expensesRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );

  const needsMakeupRemoval = !!faceRes.data?.wore_makeup && !faceRes.data?.removed_makeup;

  return {
    pendingHygieneItems: totalHygieneItems - completedIds.size,
    totalHygieneItems,
    nextActivity: activityRes.data ?? null,
    todayExpenseTotal,
    needsMakeupRemoval,
  };
}

export function useDashboardSummary() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["home", "dashboard", userId],
    queryFn: () => fetchDashboardSummary(userId as string),
    enabled: !!userId,
  });
}

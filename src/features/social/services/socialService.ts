import { supabase } from "@/lib/supabase";
import type { ActivityType, Feeling, SocialActivity } from "@/features/social/types";

const PAGE_SIZE = 20;

export async function fetchActivitiesPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("social_activities")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as SocialActivity[], nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined };
}

export async function createActivity(
  userId: string,
  input: {
    activityType: ActivityType;
    title?: string;
    companions?: string;
    activityDescription?: string;
    scheduledAt: string;
    isPast: boolean;
    feeling?: Feeling;
  }
): Promise<SocialActivity> {
  const { data, error } = await supabase
    .from("social_activities")
    .insert({
      user_id: userId,
      activity_type: input.activityType,
      title: input.title ?? null,
      companions: input.companions ?? null,
      activity_description: input.activityDescription ?? null,
      scheduled_at: input.scheduledAt,
      is_past: input.isPast,
      feeling: input.feeling ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SocialActivity;
}

// Trae todas las actividades cuyo scheduled_at cae dentro de [fromIso, toIso).
// Se usa para pintar los puntos del mes visible en el calendario — el rango
// de un mes es acotado, así que no hace falta paginación acá.
export async function fetchActivitiesInRange(
  userId: string,
  fromIso: string,
  toIso: string
): Promise<SocialActivity[]> {
  const { data, error } = await supabase
    .from("social_activities")
    .select("*")
    .eq("user_id", userId)
    .gte("scheduled_at", fromIso)
    .lt("scheduled_at", toIso)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SocialActivity[];
}

export async function linkNextActivity(activityId: string, nextActivityId: string) {
  const { error } = await supabase
    .from("social_activities")
    .update({ next_activity_id: nextActivityId })
    .eq("id", activityId);
  if (error) throw error;
}

export type ActivityType = "laboral" | "amistosa" | "casual" | "familiar" | "cita" | "otro";
export type Feeling = "genial" | "bien" | "neutral" | "mal" | "agotado";

export interface SocialActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string | null;
  companions: string | null;
  activity_description: string | null;
  scheduled_at: string;
  is_past: boolean;
  feeling: Feeling | null;
  next_activity_id: string | null;
}

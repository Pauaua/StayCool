export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  makeup_reminder_enabled: boolean;
  makeup_reminder_time: string; // "HH:mm:ss"
  hygiene_reminder_enabled: boolean;
  hygiene_reminder_time: string;
  monthly_budget: number | null;
  premium_tier: "free" | "basico" | "full";
}

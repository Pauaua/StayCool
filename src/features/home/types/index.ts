export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  makeup_reminder_enabled: boolean;
  makeup_reminder_time: string; // "HH:mm:ss"
  hygiene_reminder_enabled: boolean;
  hygiene_reminder_time: string;
  skincare_morning_reminder_enabled: boolean;
  skincare_morning_reminder_time: string;
  skincare_night_reminder_enabled: boolean;
  skincare_night_reminder_time: string;
  monthly_budget: number | null;
  premium_tier: "free" | "basico" | "full";
  language: "es" | "en";
  pronoun: "masculino" | "femenino" | "no_binarie" | "no_se";
  is_menstruating: boolean;
  period_reminder_enabled: boolean;
  last_period_date: string | null; // "YYYY-MM-DD"
  cycle_length_days: number;
  period_reminder_message: string | null;
  period_reminder_days_before: number;
  paused_at: string | null;
}

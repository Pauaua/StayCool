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
}

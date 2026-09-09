export type MealCategory = "desayuno" | "almuerzo" | "cena" | "snack";
export type Mood = "genial" | "bien" | "neutral" | "mal" | "agotado";

export interface Meal {
  id: string;
  meal_date: string;
  category: MealCategory | null;
  description: string;
  rating: number | null;
}

export interface SleepLog {
  id: string;
  sleep_date: string;
  slept_at: string;
  woke_at: string;
  duration_minutes: number;
}

export interface MoodLog {
  id: string;
  mood_date: string;
  mood: Mood;
  energy_level: number | null;
  note: string | null;
}

export interface ExerciseLog {
  id: string;
  exercise_date: string;
  exercise_type: string;
  duration_minutes: number | null;
  sets: number | null;
  weight_kg: number | null;
}

export interface DailyWellnessStat {
  date: string;
  sleepHours: number;
  mealsCount: number;
}

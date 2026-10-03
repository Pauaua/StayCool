// Lógica pura de los Recordatorios Diva: a partir del estado de la persona
// decide QUÉ notificar y CUÁNDO, sin tocar expo-notifications ni Supabase
// (eso vive en scheduler.ts). Así las reglas se pueden testear con fechas
// fijas.
//
// Reglas:
// - Máximo 2 notificaciones por día, en dos horarios fijos dentro de la
//   ventana permitida (9:00–21:00): mañana 11:00 y tarde 19:00.
// - Se planifica una semana hacia adelante; cada vez que la persona abre la
//   app o registra un hábito, todo se vuelve a calcular desde cero.
// - Un hábito "vence" cuando pasaron frequencyDays desde su último registro.
//   El nivel de intensidad sube con los días de atraso, hasta 3. Ya en nivel
//   3 se recuerda día por medio, para no hacer spam.
// - Se prioriza el hábito más atrasado. Un segundo hábito el mismo día solo
//   si va "bastante atrasado" (nivel 2 o más).

import { DIVA_HABITS, type HabitKey } from "./habits";

export const SLOT_MORNING = { hour: 11, minute: 0 };
export const SLOT_EVENING = { hour: 19, minute: 0 };
export const ALLOWED_START_HOUR = 9;
export const ALLOWED_END_HOUR = 21;
export const HORIZON_DAYS = 7;
// Días sin abrir la app (contados desde la última apertura) en que se manda
// el aviso de inactividad.
export const INACTIVITY_DAYS = [3, 6];
// Rachas que se celebran (días seguidos con todos los hábitos diarios hechos).
export const STREAK_MILESTONES = [3, 7, 14, 21, 30];
// Domingo: aviso semanal de Bienestar.
export const WELLNESS_WEEKDAY = 0;
const MIN_LEAD_MS = 10 * 60 * 1000;

export type IntensityLevel = 1 | 2 | 3;
export type WellnessInsight = "moodLow" | "sleepLow" | "noExercise" | "sleepGood";
export type DivaModule = "Higiene" | "Bienestar";

export interface HabitState {
  key: HabitKey;
  // Último día registrado (YYYY-MM-DD) o null si nunca. Sin registros se
  // cuenta desde `since` (cuando se agregó al checklist), para no partir
  // en nivel 3 con alguien que recién empieza.
  lastDone: string | null;
  since: string;
}

export interface PlannerInput {
  now: Date;
  habits: HabitState[];
  streakDays: number;
  lastStreakCelebrated: number;
  wellness: WellnessInsight | null;
}

export type PlannedKind =
  | { type: "habit"; habit: HabitKey; level: IntensityLevel }
  | { type: "inactivity" }
  | { type: "streak"; days: number }
  | { type: "wellness"; insight: WellnessInsight };

export interface PlannedNotification {
  date: Date;
  kind: PlannedKind;
  module: DivaModule;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseLocalDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`);
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function levelForDaysLate(daysLate: number): IntensityLevel {
  if (daysLate >= 4) return 3;
  if (daysLate >= 2) return 2;
  return 1;
}

// Próximo hito de racha que todavía no se celebró, si la racha actual lo alcanza.
export function streakMilestoneToCelebrate(streakDays: number, lastCelebrated: number): number | null {
  const reached = STREAK_MILESTONES.filter((m) => m <= streakDays && m > lastCelebrated);
  if (reached.length > 0) return reached[reached.length - 1];
  // Pasado el último hito, se celebra cada 30 días.
  const last = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  if (streakDays > last && streakDays % 30 === 0 && streakDays > lastCelebrated) return streakDays;
  return null;
}

function at(day: Date, slot: { hour: number; minute: number }): Date {
  const d = new Date(day);
  d.setHours(slot.hour, slot.minute, 0, 0);
  return d;
}

const HABIT_ORDER = new Map(DIVA_HABITS.map((h, i) => [h.key, i]));
const HABIT_FREQUENCY = new Map(DIVA_HABITS.map((h) => [h.key, h.frequencyDays]));

interface HabitCandidate {
  key: HabitKey;
  daysLate: number;
}

function habitCandidatesFor(day: Date, habits: HabitState[]): HabitCandidate[] {
  const candidates: HabitCandidate[] = [];
  for (const habit of habits) {
    const frequency = HABIT_FREQUENCY.get(habit.key) ?? 1;
    const reference = parseLocalDate(habit.lastDone ?? habit.since);
    const daysSince = Math.max(0, daysBetween(reference, day));
    const daysLate = daysSince - frequency;
    if (daysLate < 0) continue;
    // Ya en nivel 3: día por medio.
    if (daysLate >= 4 && daysLate % 2 === 1) continue;
    candidates.push({ key: habit.key, daysLate });
  }
  return candidates.sort(
    (a, b) => b.daysLate - a.daysLate || (HABIT_ORDER.get(a.key) ?? 0) - (HABIT_ORDER.get(b.key) ?? 0)
  );
}

export function planDivaNotifications(input: PlannerInput): PlannedNotification[] {
  const { now, habits } = input;
  const today = startOfDay(now);
  const earliest = now.getTime() + MIN_LEAD_MS;
  const result: PlannedNotification[] = [];
  const streakMilestone = streakMilestoneToCelebrate(input.streakDays, input.lastStreakCelebrated);

  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
    const day = new Date(today);
    day.setDate(day.getDate() + offset);

    // Orden de preferencia: tarde primero (los hábitos diarios se recuerdan
    // a fin de día, cuando ya pasó la oportunidad de hacerlos).
    const free: Date[] = [at(day, SLOT_EVENING), at(day, SLOT_MORNING)].filter(
      (d) => d.getTime() >= earliest
    );
    const take = (preferred: "morning" | "evening"): Date | null => {
      if (free.length === 0) return null;
      const wanted = preferred === "morning" ? SLOT_MORNING.hour : SLOT_EVENING.hour;
      const index = free.findIndex((d) => d.getHours() === wanted);
      return free.splice(index >= 0 ? index : 0, 1)[0];
    };

    if (offset === 0 && streakMilestone !== null) {
      const date = take("evening");
      if (date) result.push({ date, kind: { type: "streak", days: streakMilestone }, module: "Higiene" });
    }
    if (INACTIVITY_DAYS.includes(offset)) {
      const date = take("morning");
      if (date) result.push({ date, kind: { type: "inactivity" }, module: "Higiene" });
    }
    if (input.wellness && day.getDay() === WELLNESS_WEEKDAY) {
      const date = take("morning");
      if (date) result.push({ date, kind: { type: "wellness", insight: input.wellness }, module: "Bienestar" });
    }

    const candidates = habitCandidatesFor(day, habits);
    candidates.forEach((candidate, index) => {
      // El primero entra con cualquier nivel; el segundo solo si va
      // bastante atrasado.
      if (index > 1) return;
      if (index === 1 && candidate.daysLate < 2) return;
      const date = take("evening");
      if (!date) return;
      result.push({
        date,
        kind: { type: "habit", habit: candidate.key, level: levelForDaysLate(candidate.daysLate) },
        module: "Higiene",
      });
    });
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Racha: días seguidos (hasta hoy, o hasta ayer si hoy todavía no termina)
// en que se hicieron TODOS los hábitos diarios activos.
export function computeStreak(now: Date, dailyHabitDates: Set<string>[]): number {
  if (dailyHabitDates.length === 0) return 0;
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const allDone = (d: Date) => dailyHabitDates.every((dates) => dates.has(iso(d)));

  const day = startOfDay(now);
  if (!allDone(day)) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (allDone(day) && streak < 366) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export interface WellnessWeek {
  sleepMinutes: number[]; // una entrada por noche registrada (últimos 7 días)
  exerciseSessionsWeek: number;
  exerciseSessionsMonth: number;
  lowMoodDays: number; // días con ánimo "mal" o "agotado" (últimos 7 días)
}

// Elige un solo aviso de Bienestar por semana, en orden de prioridad. Si no
// hay datos suficientes, no se manda nada (no se reta a quien no registra).
export function pickWellnessInsight(week: WellnessWeek): WellnessInsight | null {
  if (week.lowMoodDays >= 3) return "moodLow";
  const nights = week.sleepMinutes.length;
  const avgSleep = nights > 0 ? week.sleepMinutes.reduce((a, b) => a + b, 0) / nights : 0;
  if (nights >= 3 && avgSleep < 6.5 * 60) return "sleepLow";
  if (week.exerciseSessionsMonth > 0 && week.exerciseSessionsWeek === 0) return "noExercise";
  if (nights >= 3 && avgSleep >= 7.5 * 60) return "sleepGood";
  return null;
}

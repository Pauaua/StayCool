// Programa los Recordatorios Diva como notificaciones LOCALES con
// expo-notifications. Cada llamada a rescheduleDivaReminders cancela todo lo
// programado y lo vuelve a calcular desde cero con los datos actuales (ver
// planner.ts para las reglas).

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import { HABITS_BY_KEY, habitKeyForItem, type HabitKey } from "./habits";
import {
  computeStreak,
  pickWellnessInsight,
  planDivaNotifications,
  type HabitState,
  type PlannedKind,
  type PlannedNotification,
} from "./planner";
import { phraseCategory, phrasesFor, pickPhraseIndex, renderPhrase, type PhraseLanguage } from "./phrases";

export const DIVA_CHANNEL_ID = "diva-reminders";
const ID_PREFIX = "diva-";
const RECENT_PER_CATEGORY = 3;
const HISTORY_DAYS = 60;

interface ScheduledEntry {
  id: string;
  date: string;
  category: string;
  index: number;
  streakDays?: number;
}

interface StoredState {
  scheduled: ScheduledEntry[];
  recent: Record<string, number[]>;
  lastStreakCelebrated: number;
}

const stateKey = (userId: string) => `diva-reminders-state:${userId}`;

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgo(now: Date, days: number): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

async function loadState(userId: string): Promise<StoredState> {
  try {
    const raw = await AsyncStorage.getItem(stateKey(userId));
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // Estado corrupto o storage no disponible: partimos de cero.
  }
  return { scheduled: [], recent: {}, lastStreakCelebrated: 0 };
}

async function saveState(userId: string, state: StoredState) {
  await AsyncStorage.setItem(stateKey(userId), JSON.stringify(state)).catch(() => {});
}

// Las notificaciones programadas cuya hora ya pasó se mostraron: pasan al
// historial de frases recientes (y, si era una racha, queda celebrada).
function absorbDelivered(state: StoredState, now: Date): StoredState {
  const recent = { ...state.recent };
  let lastStreakCelebrated = state.lastStreakCelebrated;
  for (const entry of state.scheduled) {
    if (new Date(entry.date).getTime() > now.getTime()) continue;
    recent[entry.category] = [...(recent[entry.category] ?? []), entry.index].slice(-RECENT_PER_CATEGORY);
    if (entry.streakDays) lastStreakCelebrated = Math.max(lastStreakCelebrated, entry.streakDays);
  }
  return { scheduled: [], recent, lastStreakCelebrated };
}

async function ensureDivaChannel(lang: PhraseLanguage) {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DIVA_CHANNEL_ID, {
    name: lang === "en" ? "Diva Reminders" : "Recordatorios Diva",
    description:
      lang === "en"
        ? "Reminders with attitude to keep up your self-care habits (Diva plan)."
        : "Recordatorios con actitud para mantener tus hábitos de autocuidado (plan Diva).",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function cancelDivaReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => undefined))
  );
}

interface DivaData {
  habits: HabitState[];
  dailyHabitDates: Set<string>[];
  wellness: ReturnType<typeof pickWellnessInsight>;
}

async function loadDivaData(userId: string, now: Date): Promise<DivaData> {
  const historyStart = isoDate(daysAgo(now, HISTORY_DAYS));
  const weekStart = isoDate(daysAgo(now, 6));
  const monthStart = isoDate(daysAgo(now, 30));

  const [itemsRes, logsRes, sleepRes, exerciseRes, moodRes] = await Promise.all([
    supabase
      .from("hygiene_items")
      .select("id, label, is_hair_wash, created_at")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("hygiene_logs")
      .select("hygiene_item_id, log_date")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("log_date", historyStart),
    supabase.from("wellness_sleep").select("duration_minutes").eq("user_id", userId).gte("sleep_date", weekStart),
    supabase.from("wellness_exercise").select("exercise_date").eq("user_id", userId).gte("exercise_date", monthStart),
    supabase.from("wellness_mood").select("mood").eq("user_id", userId).gte("mood_date", weekStart),
  ]);
  for (const res of [itemsRes, logsRes, sleepRes, exerciseRes, moodRes]) {
    if (res.error) throw res.error;
  }

  const datesByItem = new Map<string, Set<string>>();
  for (const log of logsRes.data ?? []) {
    const dates = datesByItem.get(log.hygiene_item_id) ?? new Set<string>();
    dates.add(log.log_date);
    datesByItem.set(log.hygiene_item_id, dates);
  }

  const byHabit = new Map<HabitKey, HabitState>();
  const dailyHabitDates: Set<string>[] = [];
  for (const item of itemsRes.data ?? []) {
    const key = habitKeyForItem(item);
    if (!key) continue;
    const dates = datesByItem.get(item.id) ?? new Set<string>();
    const lastDone = [...dates].sort().pop() ?? null;
    const createdAt = isoDate(new Date(item.created_at));
    const since = createdAt > historyStart ? createdAt : historyStart;
    const existing = byHabit.get(key);
    if (!existing || (lastDone ?? "") > (existing.lastDone ?? "")) {
      byHabit.set(key, { key, lastDone, since });
    }
    if (HABITS_BY_KEY[key].frequencyDays === 1) dailyHabitDates.push(dates);
  }

  const exerciseDates = (exerciseRes.data ?? []).map((e) => e.exercise_date);
  const wellness = pickWellnessInsight({
    sleepMinutes: (sleepRes.data ?? []).map((s) => s.duration_minutes ?? 0).filter((m) => m > 0),
    exerciseSessionsWeek: exerciseDates.filter((d) => d >= weekStart).length,
    exerciseSessionsMonth: exerciseDates.length,
    lowMoodDays: (moodRes.data ?? []).filter((m) => m.mood === "mal" || m.mood === "agotado").length,
  });

  return { habits: [...byHabit.values()], dailyHabitDates, wellness };
}

async function scheduleOne(
  id: string,
  planned: Pick<PlannedNotification, "kind" | "module">,
  lang: PhraseLanguage,
  index: number,
  trigger: Notifications.NotificationTriggerInput
) {
  const phrase = renderPhrase(phrasesFor(planned.kind, lang)[index], planned.kind);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: phrase.title,
      body: phrase.body,
      data: { module: planned.module, divaKind: planned.kind.type },
    },
    trigger,
  });
}

async function reschedule(userId: string, lang: PhraseLanguage) {
  const { granted } = await Notifications.getPermissionsAsync();
  await cancelDivaReminders();
  if (!granted) return;

  const now = new Date();
  const state = absorbDelivered(await loadState(userId), now);
  const data = await loadDivaData(userId, now);
  const plan = planDivaNotifications({
    now,
    habits: data.habits,
    streakDays: computeStreak(now, data.dailyHabitDates),
    lastStreakCelebrated: state.lastStreakCelebrated,
    wellness: data.wellness,
  });

  await ensureDivaChannel(lang);
  const lastPicked: Record<string, number> = {};
  for (const [i, planned] of plan.entries()) {
    const category = phraseCategory(planned.kind);
    const count = phrasesFor(planned.kind, lang).length;
    const recent = [...(state.recent[category] ?? [])];
    if (lastPicked[category] !== undefined) recent.push(lastPicked[category]);
    const index = pickPhraseIndex(count, recent);
    lastPicked[category] = index;

    const id = `${ID_PREFIX}${i}`;
    await scheduleOne(id, planned, lang, index, {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: planned.date,
      channelId: Platform.OS === "android" ? DIVA_CHANNEL_ID : undefined,
    });
    state.scheduled.push({
      id,
      date: planned.date.toISOString(),
      category,
      index,
      streakDays: planned.kind.type === "streak" ? planned.kind.days : undefined,
    });
  }
  await saveState(userId, state);
}

// Serializa las reprogramaciones: si llegan varias seguidas (abrir la app +
// registrar un hábito), corren una detrás de otra en vez de pisarse.
let queue: Promise<void> = Promise.resolve();

export function rescheduleDivaReminders(userId: string, lang: PhraseLanguage): Promise<void> {
  queue = queue
    .then(() => reschedule(userId, lang))
    .catch((error) => console.warn("No se pudieron programar los Recordatorios Diva", error));
  return queue;
}

export function cancelDivaRemindersQueued(): Promise<void> {
  queue = queue.then(cancelDivaReminders).catch(() => undefined);
  return queue;
}

// Solo desarrollo: dispara una notificación de cada tipo, separadas por
// unos segundos, empezando a los 10 segundos.
export async function fireDivaTestNotifications(lang: PhraseLanguage) {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  await ensureDivaChannel(lang);
  const samples: Pick<PlannedNotification, "kind" | "module">[] = [
    { kind: { type: "habit", habit: "ducha", level: 1 }, module: "Higiene" },
    { kind: { type: "habit", habit: "lavadoPelo", level: 2 }, module: "Higiene" },
    { kind: { type: "habit", habit: "cepillado", level: 3 }, module: "Higiene" },
    { kind: { type: "inactivity" }, module: "Higiene" },
    { kind: { type: "streak", days: 4 }, module: "Higiene" },
    { kind: { type: "wellness", insight: "sleepLow" } as PlannedKind, module: "Bienestar" },
  ];
  for (const [i, sample] of samples.entries()) {
    // Prefijo propio: la reprogramación normal (que cancela "diva-*") no las toca.
    await scheduleOne(`divatest-${i}`, sample, lang, 0, {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10 + i * 4,
      channelId: Platform.OS === "android" ? DIVA_CHANNEL_ID : undefined,
    });
  }
  return true;
}

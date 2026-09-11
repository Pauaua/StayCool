import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchProfile, updateProfile, uploadAvatarPhoto } from "@/features/home/services/profileService";
import {
  cancelReminder,
  REMINDER_IDS,
  scheduleDailyReminder,
  scheduleOneTimeReminder,
} from "@/notifications/notifications";
import type { Profile } from "@/features/home/types";

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => updateProfile(userId as string, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

export function useUploadAvatarPhoto() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (localImageUri: string) => uploadAvatarPhoto(userId as string, localImageUri),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(":").map(Number);
  return { hour: hour ?? 22, minute: minute ?? 0 };
}

// Próxima fecha de "día 1" en o después de hoy, a partir del último período
// registrado y la duración del ciclo. Si last_period_date es en el futuro
// (dato mal ingresado) o hoy mismo, esa misma fecha ya es la "próxima".
function nextPeriodDate(lastPeriodDate: string, cycleLengthDays: number): Date {
  const last = new Date(`${lastPeriodDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysSinceLast = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const cyclesElapsed = Math.max(0, Math.ceil(daysSinceLast / cycleLengthDays));
  const next = new Date(last);
  next.setDate(next.getDate() + cyclesElapsed * cycleLengthDays);
  return next;
}

// Mantiene los recordatorios push locales sincronizados con las preferencias
// guardadas en el perfil, cada vez que este cambia (incluida la primera carga).
export function useSyncReminders() {
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!profile) return;

    if (profile.makeup_reminder_enabled) {
      const { hour, minute } = parseTime(profile.makeup_reminder_time);
      scheduleDailyReminder(
        REMINDER_IDS.makeupRemoval,
        "Hora de desmaquillarte 💄",
        "No olvides quitarte el maquillaje antes de dormir.",
        hour,
        minute
      );
    } else {
      cancelReminder(REMINDER_IDS.makeupRemoval);
    }

    if (profile.hygiene_reminder_enabled) {
      const { hour, minute } = parseTime(profile.hygiene_reminder_time);
      scheduleDailyReminder(
        REMINDER_IDS.hygieneChecklist,
        "Checklist de higiene 🪥",
        "Revisa si te falta algo en tu checklist de hoy.",
        hour,
        minute
      );
    } else {
      cancelReminder(REMINDER_IDS.hygieneChecklist);
    }

    if (profile.skincare_morning_reminder_enabled) {
      const { hour, minute } = parseTime(profile.skincare_morning_reminder_time);
      scheduleDailyReminder(
        REMINDER_IDS.skincareMorning,
        "Skincare matutino ☀️",
        "Es hora de tu rutina de skincare de la mañana.",
        hour,
        minute
      );
    } else {
      cancelReminder(REMINDER_IDS.skincareMorning);
    }

    if (profile.skincare_night_reminder_enabled) {
      const { hour, minute } = parseTime(profile.skincare_night_reminder_time);
      scheduleDailyReminder(
        REMINDER_IDS.skincareNight,
        "Skincare nocturno 🌙",
        "Es hora de tu rutina de skincare de la noche.",
        hour,
        minute
      );
    } else {
      cancelReminder(REMINDER_IDS.skincareNight);
    }

    if (profile.is_menstruating && profile.last_period_date) {
      const predicted = nextPeriodDate(profile.last_period_date, profile.cycle_length_days);
      const alertDate = new Date(predicted);
      alertDate.setDate(alertDate.getDate() - profile.period_reminder_days_before);
      alertDate.setHours(9, 0, 0, 0);
      scheduleOneTimeReminder(
        REMINDER_IDS.periodComing,
        "Se viene, se viene 🩸",
        profile.period_reminder_message?.trim() || "Se aproxima desprendimiento de endometrio, ¡Prepárate!",
        alertDate
      );
    } else {
      cancelReminder(REMINDER_IDS.periodComing);
    }
  }, [profile]);
}

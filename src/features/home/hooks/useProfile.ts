import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { claimTrial, fetchProfile, updateProfile, uploadAvatarPhoto } from "@/features/home/services/profileService";
import { deleteAccount } from "@/features/home/services/accountService";
import {
  cancelReminder,
  REMINDER_IDS,
  scheduleDailyReminder,
  scheduleOneTimeReminder,
} from "@/notifications/notifications";
import type { Profile } from "@/features/home/types";
// Solo se usa dentro de efectos (no al cargar el módulo), así que el import
// circular con i18n (que usa useProfile) no da problemas.
import { translate, type Language } from "@/lib/i18n";

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
  });
}

// Si la cuenta está pausada (ver "Pausar cuenta" en Configuración), el solo
// hecho de volver a loguearse y cargar el perfil la reactiva automáticamente
// — mismo comportamiento que Instagram/Facebook con la desactivación
// temporal. No hay nada que bloquear del lado de auth: la cuenta nunca dejó
// de poder loguearse, solo estaba marcada como pausada.
export function useAutoReactivateAccount() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  useEffect(() => {
    if (profile?.paused_at) {
      update.mutate({ paused_at: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.paused_at]);
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

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}

export function useClaimTrial() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimTrial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

export function useUploadAvatarPhoto() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ localImageUri, previousPath }: { localImageUri: string; previousPath: string | null }) =>
      uploadAvatarPhoto(userId as string, localImageUri, previousPath),
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
    const lang: Language = profile.language === "en" ? "en" : "es";

    if (profile.makeup_reminder_enabled) {
      const { hour, minute } = parseTime(profile.makeup_reminder_time);
      scheduleDailyReminder(
        REMINDER_IDS.makeupRemoval,
        translate(lang, "notif.makeupTitle"),
        translate(lang, "notif.makeupBody"),
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
        translate(lang, "notif.hygieneTitle"),
        translate(lang, "notif.hygieneBody"),
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
        translate(lang, "notif.skincareMorningTitle"),
        translate(lang, "notif.skincareMorningBody"),
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
        translate(lang, "notif.skincareNightTitle"),
        translate(lang, "notif.skincareNightBody"),
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
        translate(lang, "notif.periodTitle"),
        profile.period_reminder_message?.trim() || translate(lang, "notif.periodBody"),
        alertDate
      );
    } else {
      cancelReminder(REMINDER_IDS.periodComing);
    }
  }, [profile]);
}

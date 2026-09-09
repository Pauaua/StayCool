import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchProfile, updateProfile, uploadAvatarPhoto } from "@/features/home/services/profileService";
import { cancelReminder, REMINDER_IDS, scheduleDailyReminder } from "@/notifications/notifications";
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
  }, [profile]);
}

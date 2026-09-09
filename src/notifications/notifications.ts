import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // shouldShowBanner/shouldShowList reemplazan a shouldShowAlert desde que
    // iOS separó el banner de la lista de notificaciones (expo-notifications
    // SDK 54+).
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    // Android exige que el canal exista antes de programar una notificación
    // que lo referencie por channelId.
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Recordatorios",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const { status: requested } = await Notifications.requestPermissionsAsync();
  return requested === "granted";
}

// Recordatorio diario recurrente (ej: "sácate el maquillaje", checklist de
// higiene pendiente antes de dormir). hour/minute son locales al device.
export async function scheduleDailyReminder(id: string, title: string, body: string, hour: number, minute: number) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === "android" ? "reminders" : undefined,
    },
  });
}

export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}

export const REMINDER_IDS = {
  makeupRemoval: "makeup-removal-reminder",
  hygieneChecklist: "hygiene-checklist-reminder",
  skincareMorning: "skincare-morning-reminder",
  skincareNight: "skincare-night-reminder",
} as const;

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

// Aviso puntual para una fecha/hora futura específica (a diferencia de
// scheduleDailyReminder, que se repite todos los días). Se usa para el aviso
// de "se viene tu período", que no cae en un día fijo sino que depende del
// ciclo de cada persona. No-op si la fecha ya pasó, para no reventar al
// llamar a Notifications con un trigger en el pasado.
export async function scheduleOneTimeReminder(id: string, title: string, body: string, date: Date) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: Platform.OS === "android" ? "reminders" : undefined,
    },
  });
}

export const REMINDER_IDS = {
  makeupRemoval: "makeup-removal-reminder",
  hygieneChecklist: "hygiene-checklist-reminder",
  skincareMorning: "skincare-morning-reminder",
  skincareNight: "skincare-night-reminder",
  periodComing: "period-coming-reminder",
} as const;

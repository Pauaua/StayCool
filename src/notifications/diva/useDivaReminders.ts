import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/home/hooks/useProfile";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useT } from "@/lib/i18n";
import { onDivaDataChanged, requestOpenModule } from "./events";
import { cancelDivaRemindersQueued, rescheduleDivaReminders } from "./scheduler";

const settingKey = (userId: string) => `diva-reminders-enabled:${userId}`;

// Switch "Recordatorios Diva" (on/off), guardado en el dispositivo porque las
// notificaciones también son locales. null = todavía no decidió (no vio la
// presentación de la función).
export function useDivaRemindersSetting() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const queryKey = ["diva-reminders-enabled", userId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<boolean | null> => {
      const value = await AsyncStorage.getItem(settingKey(userId as string)).catch(() => null);
      return value === null ? null : value === "1";
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

  // Al activar se pide el permiso de notificaciones; si la persona lo
  // rechaza, el switch queda apagado. Devuelve el valor final.
  async function setEnabled(value: boolean): Promise<boolean> {
    if (!userId) return false;
    let finalValue = value;
    if (value) {
      const { granted } = await Notifications.requestPermissionsAsync();
      finalValue = granted;
    }
    await AsyncStorage.setItem(settingKey(userId), finalValue ? "1" : "0").catch(() => {});
    queryClient.setQueryData(queryKey, finalValue);
    return finalValue;
  }

  return {
    enabled: query.data === true,
    decided: query.data === true || query.data === false,
    isLoaded: query.isSuccess,
    setEnabled,
  };
}

// Mantiene los Recordatorios Diva programados mientras la cuenta es Diva
// (suscripción "full" o prueba gratis) y el switch está activo: recalcula al
// montar, al volver la app a primer plano, al registrar hábitos y cuando
// cambia el plan (PremiumProvider ya escucha addCustomerInfoUpdateListener).
// Si deja de ser Diva o apaga el switch, cancela todo.
export function useDivaReminders() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile();
  const { isFull, isLoading } = usePremium();
  const { enabled, isLoaded } = useDivaRemindersSetting();
  const { lang } = useT();

  const ready = !!userId && !!profile && !isLoading && isLoaded;
  const active = isFull && enabled;

  const run = useCallback(() => {
    if (!ready || !userId) return;
    if (active) rescheduleDivaReminders(userId, lang);
    else cancelDivaRemindersQueued();
  }, [ready, active, userId, lang]);

  useEffect(() => {
    run();
  }, [run]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") run();
    });
    return () => subscription.remove();
  }, [run]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = onDivaDataChanged(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 1000);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [run]);
}

// Al tocar una notificación que trae `data.module`, pide abrir ese módulo.
// onOpen se llama además para que RootNavigator pase del saludo a la agenda.
const handledResponses = new Set<string>();

export function useNotificationTapRouting(onOpen: () => void) {
  useEffect(() => {
    function handle(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      const id = response.notification.request.identifier + response.notification.date;
      if (handledResponses.has(id)) return;
      handledResponses.add(id);
      const module = response.notification.request.content.data?.module;
      if (typeof module !== "string") return;
      requestOpenModule(module);
      onOpen();
    }

    Notifications.getLastNotificationResponseAsync().then(handle).catch(() => undefined);
    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => subscription.remove();
  }, [onOpen]);
}

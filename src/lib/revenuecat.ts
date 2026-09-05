import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { env } from "@/config/env";

// Identificadores de los entitlements configurados en el dashboard de
// RevenueCat para "Agenda Cool+". Deben coincidir exactamente con los
// nombres creados ahí (ver README para el paso a paso). "full" es jerárquico
// sobre "basico": el producto Full debe otorgar AMBOS entitlements en su
// configuración de RevenueCat, no solo "full".
export const ENTITLEMENT_BASICO = "basico";
export const ENTITLEMENT_FULL = "full";

export function initRevenueCat() {
  const apiKey = Platform.select({
    ios: env.revenueCatApiKeyIos,
    android: env.revenueCatApiKeyAndroid,
  });

  if (!apiKey) {
    console.warn("RevenueCat API key no configurada, compras en modo no-op.");
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
}

export function identifyRevenueCatUser(userId: string) {
  Purchases.logIn(userId).catch((error) => {
    console.warn("RevenueCat logIn falló", error);
  });
}

export function resetRevenueCatUser() {
  Purchases.logOut().catch((error) => {
    console.warn("RevenueCat logOut falló", error);
  });
}

export { Purchases };

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { ENTITLEMENT_BASICO, ENTITLEMENT_FULL } from "@/lib/revenuecat";
import { env } from "@/config/env";
import { useProfile } from "@/features/home/hooks/useProfile";

export type PremiumTier = "free" | "basico" | "full";

interface PremiumContextValue {
  tier: PremiumTier;
  isBasico: boolean; // true también para "full" (jerárquico: full incluye básico)
  isFull: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  refresh: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

// Promo de testeo: mientras dure la prueba cerrada de Play Store, todas las
// cuentas son Diva ("full"). Vence al terminar el 1 de octubre de 2026 (hora
// de Chile); después cada cuenta vuelve a su plan real sin tocar nada más.
export const TESTER_PROMO_ENDS_AT = new Date("2026-10-02T00:00:00-03:00");

export function isTesterPromoActive(): boolean {
  return Date.now() < TESTER_PROMO_ENDS_AT.getTime();
}

// trialActive: prueba gratuita de 3 días (ver claim_trial() en Postgres) —
// mientras esté vigente, la cuenta se trata como "full" aunque no tenga
// ningún entitlement real de RevenueCat activo. No pisa una suscripción
// real: si el usuario además tiene el entitlement full pagado, ese ya
// devuelve "full" de todos modos.
export function resolveTier(info: CustomerInfo | null, trialActive: boolean): PremiumTier {
  // Bypass de desarrollo: __DEV__ es false en cualquier build de producción
  // (o preview/release), así que esto nunca se cuela a usuarios reales.
  // Sirve para poder revisar pantallas/funciones premium sin tener que
  // pagar una suscripción real mientras se prueba en local.
  if (__DEV__) return "full";
  if (isTesterPromoActive()) return "full";

  const active = info?.entitlements.active ?? {};
  if (active[ENTITLEMENT_FULL]) return "full";
  if (trialActive) return "full";
  if (active[ENTITLEMENT_BASICO]) return "basico";
  return "free";
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: profile } = useProfile();

  const hasApiKey = Boolean(env.revenueCatApiKeyIos || env.revenueCatApiKeyAndroid);
  const trialActive = Boolean(profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());
  const testerPromoActive = isTesterPromoActive();
  // Fuerza un re-render justo cuando vence la prueba: sin esto, con la app
  // abierta el plan seguiría siendo "full" hasta que algo más la re-renderice.
  const [, setExpiryTick] = useState(0);
  const trialEndsAtIso = profile?.trial_ends_at ?? null;
  useEffect(() => {
    if (!trialEndsAtIso) return;
    const msLeft = new Date(trialEndsAtIso).getTime() - Date.now();
    if (msLeft <= 0) return;
    const timer = setTimeout(() => setExpiryTick((n) => n + 1), msLeft + 500);
    return () => clearTimeout(timer);
  }, [trialEndsAtIso]);
  // Igual que arriba, pero para el fin de la promo de testeo.
  useEffect(() => {
    const msLeft = TESTER_PROMO_ENDS_AT.getTime() - Date.now();
    if (msLeft <= 0) return;
    const timer = setTimeout(() => setExpiryTick((n) => n + 1), msLeft + 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasApiKey) {
      setIsLoading(false);
      return;
    }

    Purchases.getCustomerInfo()
      .then(setCustomerInfo)
      .catch((error) => console.warn("RevenueCat getCustomerInfo falló", error))
      .finally(() => setIsLoading(false));

    const listener = (info: CustomerInfo) => setCustomerInfo(info);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [hasApiKey]);

  const value = useMemo<PremiumContextValue>(() => {
    const tier = resolveTier(customerInfo, trialActive);
    return {
      tier,
      isBasico: tier === "basico" || tier === "full",
      isFull: tier === "full",
      isLoading,
      customerInfo,
      async refresh() {
        if (!hasApiKey) return;
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
      },
    };
    // testerPromoActive no se usa adentro (resolveTier lo consulta), pero
    // está en las deps para que el plan se recalcule cuando termine la promo.
  }, [customerInfo, isLoading, hasApiKey, trialActive, testerPromoActive]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium debe usarse dentro de <PremiumProvider>");
  return ctx;
}

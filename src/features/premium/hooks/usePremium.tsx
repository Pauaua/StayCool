import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { ENTITLEMENT_BASICO, ENTITLEMENT_FULL } from "@/lib/revenuecat";
import { env } from "@/config/env";

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

export function resolveTier(info: CustomerInfo | null): PremiumTier {
  // Bypass de desarrollo: __DEV__ es false en cualquier build de producción
  // (o preview/release), así que esto nunca se cuela a usuarios reales.
  // Sirve para poder revisar pantallas/funciones premium sin tener que
  // pagar una suscripción real mientras se prueba en local.
  if (__DEV__) return "full";

  const active = info?.entitlements.active ?? {};
  if (active[ENTITLEMENT_FULL]) return "full";
  if (active[ENTITLEMENT_BASICO]) return "basico";
  return "free";
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasApiKey = Boolean(env.revenueCatApiKeyIos || env.revenueCatApiKeyAndroid);

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
    const tier = resolveTier(customerInfo);
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
  }, [customerInfo, isLoading, hasApiKey]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium debe usarse dentro de <PremiumProvider>");
  return ctx;
}

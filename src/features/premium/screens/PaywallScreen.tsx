import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Purchases } from "@/lib/revenuecat";
import { usePremium, type PremiumTier } from "@/features/premium/hooks/usePremium";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { useHideRailWhileMounted } from "@/navigation/RailVisibilityContext";
import { FallingCircles } from "@/components/ui/FallingCircles";
import { useT } from "@/lib/i18n";
import { env } from "@/config/env";

// Amarillo predominante, mezclado con el resto de la paleta.
const PAYWALL_CIRCLE_COLORS = ["#fef1ba", "#fef1ba", "#fef1ba", "#ecc6ff", "#d9ebff", "#ebfff7"];

// Copy de los 3 planes. El precio de "So Basic!" es fijo (no depende de
// RevenueCat) porque todavía no hay producto configurado en el dashboard;
// en cuanto exista, el precio real de la tienda (pkg.product.priceString)
// pisa a este texto — ver `findPackageForTier`.
// Tipo de cambio aproximado solo para mostrar una referencia en USD junto al
// precio en CLP — no es un valor en vivo, así que puede desactualizarse; está
// bien porque es solo orientativo, la tienda siempre cobra en la moneda real
// del usuario.
const CLP_PER_USD = 950;

function formatUsdApprox(clp: number): string {
  return `(~USD ${(clp / CLP_PER_USD).toFixed(2)})`;
}

const PLAN_INFO: {
  tier: PremiumTier;
  name: string;
  icon?: number;
  fallbackPrice: string;
  features: string[];
}[] = [
  {
    tier: "free",
    name: "Plan Gratis",
    icon: require("../../../../assets/images/solazo.png"),
    fallbackPrice: "Gratis",
    features: [
      "Bienestar, Cuidado Personal, Imagen, Pelo, Gastos, Gustos, Notas y Social",
      "Todo lo que ya usas hoy en la app.",
    ],
  },
  {
    tier: "basico",
    name: "Plan So Basic!",
    icon: require("../../../../assets/images/uñotas.png"),
    fallbackPrice: `$2.990 CLP/mes ${formatUsdApprox(2990)}`,
    features: [
      "Todo lo del plan Gratis",
      "Ver tu resumen semanal",
      "Compartir tu wrapper mensual en tus historias",
    ],
  },
  {
    tier: "full",
    name: "Plan Diva",
    icon: require("../../../../assets/images/brillitos.png"),
    fallbackPrice: `$7.990 CLP/mes ${formatUsdApprox(7990)}`,
    features: [
      "Todo lo del plan So Basic!",
      "Personalizar tu foto de perfil",
      "Ver tu resumen semanal, mensual y anual",
      "Estadísticas asociadas a tus datos descargables en PDF",
    ],
  },
];

// Heurística para emparejar un producto de RevenueCat con su plan: busca el
// nombre del tier en el identifier del paquete o del producto. Cuando se
// creen los productos reales en el dashboard, conviene nombrarlos
// "basico_mensual" / "full_mensual" (o similar) para que esto matchee solo.
function findPackageForTier(packages: PurchasesPackage[], tier: PremiumTier): PurchasesPackage | undefined {
  return packages.find(
    (pkg) =>
      pkg.identifier.toLowerCase().includes(tier) || pkg.product.identifier.toLowerCase().includes(tier)
  );
}

export function PaywallScreen() {
  const goToWelcome = useGoToWelcome();
  useHideRailWhileMounted();
  const { t } = useT();
  const { tier, refresh } = usePremium();
  const hasApiKey = Boolean(env.revenueCatApiKeyIos || env.revenueCatApiKeyAndroid);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(hasApiKey);
  const [pendingTier, setPendingTier] = useState<PremiumTier | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!hasApiKey) return;
    Purchases.getOfferings()
      .then((offerings) => setOffering(offerings.current))
      .catch((error) => {
        console.warn("RevenueCat getOfferings falló", error);
      })
      .finally(() => setIsLoading(false));
  }, [hasApiKey]);

  async function handlePurchase(planTier: PremiumTier, pkg: PurchasesPackage) {
    setPendingTier(planTier);
    try {
      await Purchases.purchasePackage(pkg);
      await refresh();
      Alert.alert("¡Listo!", "Tu suscripción está activa.");
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert("No se pudo completar la compra", error instanceof Error ? error.message : "Intenta de nuevo.");
      }
    } finally {
      setPendingTier(null);
    }
  }

  async function handleManageSubscription() {
    try {
      await Purchases.showManageSubscriptions();
      await refresh();
    } catch (error) {
      Alert.alert(
        "No se pudo abrir la gestión de suscripción",
        error instanceof Error ? error.message : "Intenta de nuevo."
      );
    }
  }

  async function handleRestore() {
    setIsRestoring(true);
    try {
      await Purchases.restorePurchases();
      await refresh();
      Alert.alert("Compras restauradas", "Revisamos tu cuenta y actualizamos tu plan.");
    } catch (error) {
      Alert.alert("No se pudo restaurar", error instanceof Error ? error.message : "Intenta de nuevo.");
    } finally {
      setIsRestoring(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-surface-dark">
        <ActivityIndicator color="#002054" size="large" />
      </SafeAreaView>
    );
  }

  const packages = offering?.availablePackages ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#fffaeb" }}>
      <FallingCircles colors={PAYWALL_CIRCLE_COLORS} />
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={goToWelcome} className="flex-row items-center mb-3" hitSlop={8}>
          <Text className="text-xl text-brand-500">‹</Text>
          <Text className="text-sm text-brand-500 ml-1">Panel inicial</Text>
        </Pressable>

        <View className="flex-row items-center justify-center mb-1">
          <View
            style={{ width: 8, height: 24, borderRadius: 4, backgroundColor: "#fef1ba", marginRight: 8 }}
          />
          <Text className="text-2xl font-bold text-surface-dark dark:text-white text-center">
            {t("paywall.title")}
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t("paywall.currentPlan", {
            plan: tier === "full" ? "Diva" : tier === "basico" ? "So Basic!" : "Gratis",
          })}
        </Text>

        {!hasApiKey ? (
          <Card className="mb-4 bg-accent-amber/10 border border-accent-amber">
            <Text className="text-sm text-surface-dark dark:text-white">{t("paywall.notConnected")}</Text>
          </Card>
        ) : null}

        {PLAN_INFO.map((plan) => {
          const pkg = findPackageForTier(packages, plan.tier);
          const isCurrentPlan = tier === plan.tier;
          const isPending = pendingTier === plan.tier;

          return (
            <Card key={plan.tier} className="mb-4" style={{ borderLeftWidth: 4, borderLeftColor: "#fef1ba" }}>
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                  {plan.icon ? (
                    <Image
                      source={plan.icon}
                      style={{ width: 48, height: 48, marginRight: 8 }}
                      resizeMode="contain"
                    />
                  ) : null}
                  <Text className="text-base font-bold text-surface-dark dark:text-white">
                    {plan.name}
                  </Text>
                </View>
                {isCurrentPlan ? (
                  <Text className="text-xs font-semibold text-brand-500">{t("paywall.currentPlanBadge")}</Text>
                ) : null}
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {pkg
                  ? pkg.product.currencyCode === "CLP"
                    ? `${pkg.product.priceString} ${formatUsdApprox(pkg.product.price)}`
                    : pkg.product.priceString
                  : plan.fallbackPrice}
              </Text>

              {plan.features.map((feature) => (
                <Text key={feature} className="text-sm text-surface-dark dark:text-white mb-1">
                  • {feature}
                </Text>
              ))}

              {plan.tier === "free" ? null : plan.tier === "full" && isCurrentPlan ? (
                <View
                  className="mt-3 rounded-full px-5 py-3.5 items-center justify-center"
                  style={{ backgroundColor: "#fef1ba", opacity: 0.7 }}
                >
                  <Text className="font-semibold text-base" style={{ color: "#002054" }}>
                    ¡Ya eres una Diva!
                  </Text>
                </View>
              ) : isCurrentPlan ? null : (
                <Pressable
                  onPress={() => pkg && handlePurchase(plan.tier, pkg)}
                  disabled={!pkg || pendingTier !== null}
                  className="mt-3 rounded-full px-5 py-3.5 items-center justify-center"
                  style={{
                    backgroundColor: "#fef1ba",
                    opacity: !pkg || pendingTier !== null ? 0.5 : 1,
                  }}
                >
                  {isPending ? (
                    <ActivityIndicator color="#002054" />
                  ) : (
                    <Text className="font-semibold text-base" style={{ color: "#002054" }}>
                      {pkg ? t("paywall.subscribe") : t("paywall.comingSoon")}
                    </Text>
                  )}
                </Pressable>
              )}
            </Card>
          );
        })}

        <View className="mt-2">
          <Button
            label={t("paywall.restore")}
            variant="ghost"
            onPress={handleRestore}
            loading={isRestoring}
            disabled={isRestoring || pendingTier !== null}
          />
        </View>

        {tier !== "free" ? (
          <Pressable
            onPress={handleManageSubscription}
            disabled={pendingTier !== null}
            className="mt-2 rounded-full px-6 py-3.5 flex-row items-center justify-center border border-brand-500"
            style={{ opacity: pendingTier !== null ? 0.5 : 1 }}
          >
            <Image
              source={require("../../../../assets/images/troste.png")}
              style={{ width: 20, height: 20, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text className="font-semibold text-base text-brand-500">
              {t("paywall.cancelSubscription")}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import type {
  CustomerInfo,
  GoogleProductChangeInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ENTITLEMENT_BASICO, ENTITLEMENT_FULL, Purchases } from "@/lib/revenuecat";
import { useProfile } from "@/features/home/hooks/useProfile";
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

// Las tiendas piden que la pantalla de compra enlace a la política de
// privacidad y a los términos (publicados en el sitio de StayCool).
const PRIVACY_URL = "https://www.staycool.cl/privacidad";
const TERMS_URL = "https://www.staycool.cl/terminos";

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
      "Notificaciones personalizadas a tu gusto",
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

// Suscripción pagada vigente en Google Play (la prueba gratis y la promo de
// testeo no pasan por la tienda, así que no cuentan). El producto Diva otorga
// ambos entitlements, por eso se mira "full" primero.
function getActivePlaySubscription(
  info: CustomerInfo | null
): { tier: "basico" | "full"; productId: string } | null {
  const active = info?.entitlements.active ?? {};
  for (const entitlement of [ENTITLEMENT_FULL, ENTITLEMENT_BASICO] as const) {
    const ent = active[entitlement];
    if (ent && ent.store === "PLAY_STORE") {
      // En Android el id puede venir como "full_mensual:plan-base"; Google
      // pide solo el id de la suscripción.
      return { tier: entitlement, productId: ent.productIdentifier.split(":")[0] };
    }
  }
  return null;
}

export function PaywallScreen() {
  const goToWelcome = useGoToWelcome();
  useHideRailWhileMounted();
  const { t } = useT();
  const { tier, refresh, applyCustomerInfo, customerInfo } = usePremium();
  const { data: profile } = useProfile();
  // "Prueba" = es Diva solo por el regalo, sin una suscripción real activa. Si
  // además tiene el entitlement pagado, el mensaje de prueba no aplica.
  const hasPaidFull = Boolean(customerInfo?.entitlements.active[ENTITLEMENT_FULL]);
  // Solo una suscripción real de la tienda se puede gestionar/cancelar; la
  // prueba gratis y la promo de testeo también dan tier "full" pero no tienen
  // nada que cancelar en Google Play.
  const hasPaidSubscription = (customerInfo?.activeSubscriptions.length ?? 0) > 0;
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isTrialActive = Boolean(trialEndsAt && trialEndsAt > new Date()) && !hasPaidFull;
  const trialEndedNotice = Boolean(profile?.trial_claimed_at) && !isTrialActive && tier === "free";
  const hasApiKey = Boolean(env.revenueCatApiKeyIos || env.revenueCatApiKeyAndroid);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(hasApiKey);
  const [pendingTier, setPendingTier] = useState<PremiumTier | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  // Sin red o con la tienda caída getOfferings falla (o no hay offering
  // "current"), y sin esto todos los planes quedaban en "Próximamente" sin
  // forma de reintentar.
  const [offeringsError, setOfferingsError] = useState(false);

  const loadOfferings = useCallback(() => {
    setIsLoading(true);
    setOfferingsError(false);
    Purchases.getOfferings()
      .then((offerings) => {
        setOffering(offerings.current);
        // Una offering "current" sin paquetes (p. ej. productos sin adjuntar
        // a Play Store en RevenueCat) también deja todo en "Próximamente".
        if (!offerings.current?.availablePackages.length) setOfferingsError(true);
      })
      .catch((error) => {
        console.warn("RevenueCat getOfferings falló", error);
        setOfferingsError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (hasApiKey) loadOfferings();
  }, [hasApiKey, loadOfferings]);

  async function handlePurchase(planTier: PremiumTier, pkg: PurchasesPackage) {
    // Cambio entre So Basic! y Diva en Android: sin productChangeInfo Google
    // lo trata como una suscripción nueva y la usuaria queda pagando las dos.
    // Subir cambia de inmediato y cobra solo la diferencia del período en
    // curso; bajar se aplica al terminar el período ya pagado de Diva.
    const current = Platform.OS === "android" ? getActivePlaySubscription(customerInfo) : null;
    const isUpgrade = current?.tier === "basico" && planTier === "full";
    const isDowngrade = current?.tier === "full" && planTier === "basico";
    const productChangeInfo: GoogleProductChangeInfo | null =
      current && (isUpgrade || isDowngrade)
        ? {
            oldProductIdentifier: current.productId,
            prorationMode: isUpgrade
              ? Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_PRORATED_PRICE
              : Purchases.PRORATION_MODE.DEFERRED,
          }
        : null;

    setPendingTier(planTier);
    try {
      const { customerInfo: info } = await Purchases.purchasePackage(pkg, null, productChangeInfo);
      // Usamos el CustomerInfo que devuelve la compra en vez de volver a
      // pedirlo: si ese segundo pedido fallaba, mostrábamos "No se pudo
      // completar la compra" con el cobro ya hecho.
      applyCustomerInfo(info);
      const purchasedEntitlement = planTier === "full" ? ENTITLEMENT_FULL : ENTITLEMENT_BASICO;
      if (isDowngrade) {
        Alert.alert(
          "Cambio programado",
          "Seguirás siendo Diva hasta el fin de tu período actual; después tu plan pasa a So Basic!."
        );
      } else if (info.entitlements.active[purchasedEntitlement]) {
        Alert.alert("¡Listo!", "Tu suscripción está activa.");
      } else {
        Alert.alert(
          "Recibimos tu compra",
          'Tu plan se actualizará en unos minutos. Si no ves el cambio, toca "Restaurar compras".'
        );
      }
    } catch (error: any) {
      if (error?.userCancelled) return;
      // Pago pendiente (p. ej. efectivo o transferencia en Google Play): no es
      // un error, la compra se activa sola cuando la tienda la confirme.
      if (error?.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
        Alert.alert(
          "Tu pago está pendiente",
          "La tienda todavía está procesando tu pago. Tu plan se activará apenas se confirme; no necesitas volver a comprar."
        );
        return;
      }
      // "No se encontró el artículo" de Google Play: el producto que devuelve
      // RevenueCat no está disponible para esta instalación (producto o plan
      // base inactivo en Play Console, app instalada por fuera de Play, o
      // cuenta que no es tester del track). Lo logueamos con el id exacto
      // para poder compararlo con Play Console / RevenueCat.
      if (error?.code === Purchases.PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR) {
        console.warn("Producto no disponible en la tienda", pkg.product.identifier, error);
        Alert.alert(
          "Este plan todavía no está disponible",
          "La tienda no encontró este plan. Asegúrate de haber instalado la app desde Google Play / App Store e intenta de nuevo más tarde."
        );
        return;
      }
      Alert.alert("No se pudo completar la compra", error instanceof Error ? error.message : "Intenta de nuevo.");
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
        {isTrialActive && trialEndsAt ? (
          <Text className="text-sm font-semibold text-brand-500 mb-6 text-center" style={{ marginTop: -18 }}>
            {t("paywall.trialActive", { date: format(trialEndsAt, "dd/MM/yyyy HH:mm") })}
          </Text>
        ) : null}
        {trialEndedNotice ? (
          <Card className="mb-4" style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
            <Text className="text-sm text-surface-dark dark:text-white">{t("paywall.trialEnded")}</Text>
          </Card>
        ) : null}

        {!hasApiKey ? (
          <Card className="mb-4 bg-accent-amber/10 border border-accent-amber">
            <Text className="text-sm text-surface-dark dark:text-white">{t("paywall.notConnected")}</Text>
          </Card>
        ) : null}

        {hasApiKey && offeringsError ? (
          <Card className="mb-4 bg-accent-amber/10 border border-accent-amber">
            <Text className="text-sm text-surface-dark dark:text-white">{t("paywall.offeringsError")}</Text>
            <View className="mt-3">
              <Button label={t("paywall.retry")} variant="ghost" onPress={loadOfferings} />
            </View>
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
                      {pkg
                        ? hasPaidSubscription
                          ? t("paywall.changePlan")
                          : t("paywall.subscribe")
                        : t("paywall.comingSoon")}
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

        {hasPaidSubscription ? (
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

        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          {t("paywall.autoRenewNotice")}
        </Text>
        <View className="flex-row justify-center mt-2">
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
            <Text className="text-xs font-semibold underline" style={{ color: "#002054" }}>
              {t("paywall.privacy")}
            </Text>
          </Pressable>
          <Text className="text-xs text-gray-400 mx-2">·</Text>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
            <Text className="text-xs font-semibold underline" style={{ color: "#002054" }}>
              {t("paywall.terms")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

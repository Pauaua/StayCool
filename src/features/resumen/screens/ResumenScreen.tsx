import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { colors } from "@/theme";
import { Heading } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PremiumGate } from "@/features/premium/components/PremiumGate";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { useHideRailWhileMounted } from "@/navigation/RailVisibilityContext";
import { useResumenData, useResumenPeriod, useResumenPeriodKey } from "@/features/resumen/hooks/useResumen";
import { ResumenCard } from "@/features/resumen/components/ResumenCard";
import { ShareSheet } from "@/features/resumen/components/ShareSheet";
import { captureCardImage, shareGeneric, shareToNetwork, type ShareNetwork } from "@/features/resumen/services/shareService";
import { generateAndSharePdf } from "@/features/resumen/services/pdfService";
import { useT, type TranslationKey } from "@/lib/i18n";
// import { grantMooneyForResumen } from "@/features/premium/services/mooneyService";
import { FallingCircles } from "@/components/ui/FallingCircles";
import type { ResumenPeriod } from "@/features/resumen/types";
import { expenseCategoryLabel, feelingLabel } from "@/features/resumen/labels";

const PERIOD_TABS: { id: ResumenPeriod; labelKey: TranslationKey }[] = [
  { id: "weekly", labelKey: "resumen.period.weekly" },
  { id: "monthly", labelKey: "resumen.period.monthly" },
  { id: "yearly", labelKey: "resumen.period.yearly" },
];

const PERIOD_ADJECTIVE_KEY: Record<ResumenPeriod, TranslationKey> = {
  weekly: "resumen.period.weeklyAdj",
  monthly: "resumen.period.monthlyAdj",
  yearly: "resumen.period.yearlyAdj",
};

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  return `${(minutes / 60).toFixed(1)}h`;
}

export function ResumenScreen() {
  const goToWelcome = useGoToWelcome();
  const { t } = useT();
  useHideRailWhileMounted();

  return (
    <SafeAreaView className="flex-1">
      <FallingCircles />
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
        <Pressable onPress={goToWelcome} className="flex-row items-center mb-3" hitSlop={8}>
          <Text className="text-xl text-ink">‹</Text>
          <Text className="text-sm text-ink ml-1">{t("resumen.back")}</Text>
        </Pressable>

        <View className="flex-row items-center mb-1">
          <View
            style={{ width: 8, height: 24, borderRadius: 4, backgroundColor: colors.morado, marginRight: 8 }}
          />
          <Heading className="text-2xl">{t("resumen.title")}</Heading>
        </View>
        <Text className="text-sm text-gray-500 mb-4">{t("resumen.subtitle")}</Text>
        <PremiumGate minTier="basico">
          <ResumenContent />
        </PremiumGate>
      </ScrollView>
    </SafeAreaView>
  );
}

function hasAnyResumenData(data: NonNullable<ReturnType<typeof useResumenData>["data"]>): boolean {
  return (
    data.bienestar.mealsCount > 0 ||
    data.bienestar.exerciseCount > 0 ||
    data.bienestar.avgSleepMinutes > 0 ||
    data.higiene.completionPercent > 0 ||
    data.pelo.washCount > 0 ||
    data.pelo.distinctHairstylesCount > 0 ||
    data.cara.makeupDays > 0 ||
    data.imagen.outfitsCount > 0 ||
    data.social.activitiesCount > 0 ||
    data.gastos.total > 0
  );
}

function ResumenContent() {
  const { period, setPeriod } = useResumenPeriod("weekly");
  const { data, isLoading, isError } = useResumenData(period);
  const periodKey = useResumenPeriodKey(period);
  const { tier, isFull } = usePremium();
  const { lang, t } = useT();
  const periodAdj = t(PERIOD_ADJECTIVE_KEY[period]);
  const times = (n: number) => t(n === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces");
  const money = (n: number) =>
    `$${n.toLocaleString(lang === "en" ? "en-US" : "es-AR", { maximumFractionDigits: 0 })}`;

  // Compartir/descargar el wrapped no es gratis: Free no puede ninguno, So
  // Basic! solo el mensual, Diva los tres (semanal/mensual/anual).
  const canShareThisPeriod = tier === "full" || (tier === "basico" && period === "monthly");

  // Ver el resumen anual completo es exclusivo de Diva — So Basic! (y Free,
  // que ya está bloqueado más arriba por el PremiumGate) solo ven semanal y
  // mensual.
  const canViewPeriod = (p: ResumenPeriod) => p !== "yearly" || tier === "full";

  function showPeriodLockedMessage() {
    Alert.alert(t("resumen.lockedTitle"), t("resumen.lockedViewYearly"));
  }

  function showShareLockedMessage() {
    if (period === "monthly") {
      Alert.alert(t("resumen.lockedTitle"), t("resumen.lockedMonthly"));
    } else {
      Alert.alert(t("resumen.lockedTitle"), t("resumen.lockedOther", { period: periodAdj }));
    }
  }

  const cardRef = useRef<View>(null);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [pendingNetwork, setPendingNetwork] = useState<ShareNetwork | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  async function grantShareBonus() {
    // Sparkless/MOOney: deshabilitado a propósito (no se suman monedas).
    // if (!isFull) return;
    // try {
    //   await grantMooneyForResumen(periodKey);
    // } catch (error) {
    //   console.warn("grant_mooney_for_resumen falló", error);
    // }
  }

  async function handleSelectNetwork(network: ShareNetwork) {
    setPendingNetwork(network);
    try {
      const imageUri = await captureCardImage(cardRef);
      await shareToNetwork(network, imageUri, t("resumen.shareCaption"));
      await grantShareBonus();
    } catch (error) {
      Alert.alert(t("resumen.shareFailedTitle"), error instanceof Error ? error.message : t("resumen.tryAgain"));
    } finally {
      setPendingNetwork(null);
      setShareSheetVisible(false);
    }
  }

  async function handleMoreOptions() {
    setPendingNetwork("whatsapp"); // reutilizamos el estado de "cargando" mientras se captura
    try {
      const imageUri = await captureCardImage(cardRef);
      await shareGeneric(imageUri, t("resumen.shareCaption"));
      await grantShareBonus();
    } catch (error) {
      Alert.alert(t("resumen.shareFailedTitle"), error instanceof Error ? error.message : t("resumen.tryAgain"));
    } finally {
      setPendingNetwork(null);
      setShareSheetVisible(false);
    }
  }

  async function handleDownloadPdf() {
    if (!data) return;
    setIsExportingPdf(true);
    try {
      await generateAndSharePdf(data, period, lang);
      await grantShareBonus();
    } catch (error) {
      Alert.alert(t("resumen.pdfFailedTitle"), error instanceof Error ? error.message : t("resumen.tryAgain"));
    } finally {
      setIsExportingPdf(false);
    }
  }

  // El resumen mensual/anual solo se muestra una vez que ese mes/año ya
  // terminó — mientras esté en curso, mostramos un llamado a seguir
  // completando datos en vez de un resumen a medio armar. La semana es la
  // excepción: se ve día a día aunque no haya terminado.
  const periodStillOngoing =
    period !== "weekly" && !!data && new Date() <= new Date(`${data.to}T23:59:59`);

  return (
    <View>
      <View className="flex-row bg-white dark:bg-surface-cardDark rounded-card p-1 mb-4">
        {PERIOD_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => (canViewPeriod(tab.id) ? setPeriod(tab.id) : showPeriodLockedMessage())}
            style={period === tab.id ? { backgroundColor: colors.rosado } : undefined}
            className="flex-1 py-2 rounded-card items-center"
          >
            <View className="flex-row items-center">
              {canViewPeriod(tab.id) ? null : (
                <Image
                  source={require("../../../../assets/images/candado.png")}
                  style={{ width: 14, height: 14, marginRight: 4 }}
                  resizeMode="contain"
                />
              )}
              <Text
                className={
                  period === tab.id ? "font-bold" : "text-gray-500 dark:text-gray-400"
                }
                style={period === tab.id ? { color: colors.ink } : undefined}
              >
                {t(tab.labelKey)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.ink} size="large" />
        </View>
      ) : isError || !data ? (
        <Card className="items-center py-8">
          <Text className="text-gray-500">{t("resumen.loadErrorTitle")}</Text>
        </Card>
      ) : periodStillOngoing ? (
        <Card className="items-center py-10 px-6">
          <Image
            source={require("../../../../assets/images/troste.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Text className="text-base font-bold text-surface-dark dark:text-white text-center mt-3">
            {t("resumen.ongoingTitle")}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            {t("resumen.ongoingBody", {
              period: periodAdj,
              unit: t(period === "monthly" ? "resumen.ongoingUnitMonth" : "resumen.ongoingUnitYear"),
            })}
          </Text>
        </Card>
      ) : !hasAnyResumenData(data) ? (
        <Card className="items-center py-10 px-6">
          <Image
            source={require("../../../../assets/images/troste.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Text className="text-base font-bold text-surface-dark dark:text-white text-center mt-3">
            {t("resumen.noDataTitle")}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            {t("resumen.noDataBody")}
          </Text>
        </Card>
      ) : (
        <>
          <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
            {data.displayName
              ? t("resumen.headerWithName", { period: periodAdj, name: data.displayName })
              : t("resumen.headerNoName", { period: periodAdj })}
          </Text>

          {/* Dashboard navegable in-app, en frases por módulo. Borde dorado
              sutil en mensual/anual para que quede claro que es contenido
              premium durante la prueba gratuita. */}
          <View
            className="gap-3 mb-6"
            style={
              period !== "weekly"
                ? { borderWidth: 2, borderColor: "#D4AF37", borderRadius: 16, padding: 8 }
                : undefined
            }
          >
            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionBienestar")}</Text>
                {t("resumen.dashboard.bienestar", {
                  meals: String(data.bienestar.mealsCount),
                  mealsWord: times(data.bienestar.mealsCount),
                  sleep: formatSleep(data.bienestar.avgSleepMinutes),
                  exercise: String(data.bienestar.exerciseCount),
                  exerciseWord: times(data.bienestar.exerciseCount),
                })}
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionHigiene")}</Text>
                {t("resumen.dashboard.higiene", {
                  percent: String(data.higiene.completionPercent),
                  delta:
                    data.comparison.hygieneCompletionPercentDelta !== 0
                      ? t("resumen.dashboard.higieneDelta", {
                          sign: data.comparison.hygieneCompletionPercentDelta > 0 ? "+" : "",
                          delta: String(data.comparison.hygieneCompletionPercentDelta),
                        })
                      : "",
                })}
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionPelo")}</Text>
                {t("resumen.dashboard.pelo", {
                  washes: String(data.pelo.washCount),
                  washWord: times(data.pelo.washCount),
                  styles: String(data.pelo.distinctHairstylesCount),
                  styleWord: t(
                    data.pelo.distinctHairstylesCount === 1
                      ? "resumen.dashboard.styleDistinct"
                      : "resumen.dashboard.stylesDistinct"
                  ),
                })}
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionCara")}</Text>
                {t("resumen.dashboard.cara", {
                  n: String(data.cara.makeupDays),
                  word: t(data.cara.makeupDays === 1 ? "estadisticas.word.dia" : "estadisticas.word.dias"),
                })}
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionImagen")}</Text>
                {t("resumen.dashboard.imagen", {
                  n: String(data.imagen.outfitsCount),
                  word: t(data.imagen.outfitsCount === 1 ? "estadisticas.word.outfit" : "estadisticas.word.outfits"),
                })}
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionSocial")}</Text>
                {t("resumen.dashboard.social", {
                  n: String(data.social.activitiesCount),
                  word: times(data.social.activitiesCount),
                  feeling: data.social.avgFeelingLabel
                    ? t("resumen.dashboard.socialFeeling", { feeling: feelingLabel(lang, data.social.avgFeelingLabel) })
                    : "",
                })}
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">{t("resumen.sectionGastos")}</Text>
                {t("resumen.dashboard.gastos", { amount: money(data.gastos.total) })}
              </Text>
              {Object.entries(data.gastos.breakdown).map(([kind, amount]) => (
                <Text key={kind} className="text-xs text-gray-400 mt-1">
                  {expenseCategoryLabel(lang, kind)}: {money(amount)}
                </Text>
              ))}
            </Card>
          </View>

          {/* Tarjeta compartible (capturada off-screen para el share/no se
              recorta la vista visible del dashboard) */}
          <Text className="text-sm text-gray-500 mb-2">{t("resumen.cardPreviewLabel")}</Text>
          <View className="items-center mb-6">
            <View
              style={
                period !== "weekly"
                  ? { borderWidth: 2, borderColor: "#D4AF37", borderRadius: 24, padding: 4 }
                  : undefined
              }
            >
              <ResumenCard ref={cardRef} data={data} period={period} />
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={canShareThisPeriod ? () => setShareSheetVisible(true) : showShareLockedMessage}
              className="rounded-full px-5 py-3.5 flex-row items-center justify-center"
              style={{ backgroundColor: colors.rosado }}
            >
              {canShareThisPeriod ? null : (
                <Image
                  source={require("../../../../assets/images/candado.png")}
                  style={{ width: 18, height: 18, marginRight: 8 }}
                  resizeMode="contain"
                />
              )}
              <Text className="font-semibold text-base" style={{ color: colors.ink }}>
                {t("resumen.share")}
              </Text>
            </Pressable>
            <Button
              label={canShareThisPeriod && isExportingPdf ? t("resumen.generatingPdf") : t("resumen.downloadPdf")}
              variant="outline"
              loading={canShareThisPeriod && isExportingPdf}
              onPress={canShareThisPeriod ? handleDownloadPdf : showShareLockedMessage}
              icon={!canShareThisPeriod ? require("../../../../assets/images/candado.png") : undefined}
            />
          </View>

          <ShareSheet
            visible={shareSheetVisible}
            onClose={() => setShareSheetVisible(false)}
            onSelect={handleSelectNetwork}
            onMoreOptions={handleMoreOptions}
            pendingNetwork={pendingNetwork}
          />
        </>
      )}
    </View>
  );
}

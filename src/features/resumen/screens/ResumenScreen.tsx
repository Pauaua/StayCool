import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
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
import { useT } from "@/lib/i18n";
import { grantMooneyForResumen } from "@/features/premium/services/mooneyService";
import { FallingCircles } from "@/components/ui/FallingCircles";
import type { ResumenPeriod } from "@/features/resumen/types";

const PERIOD_TABS: { id: ResumenPeriod; label: string }[] = [
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
  { id: "yearly", label: "Anual" },
];

const PERIOD_ADJECTIVE: Record<ResumenPeriod, string> = {
  weekly: "semanal",
  monthly: "mensual",
  yearly: "anual",
};

const PERIOD_UNIT: Record<ResumenPeriod, string> = {
  weekly: "semana",
  monthly: "mes",
  yearly: "año",
};

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  return `${(minutes / 60).toFixed(1)}h`;
}

export function ResumenScreen() {
  const goToWelcome = useGoToWelcome();
  useHideRailWhileMounted();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#faf3ff" }}>
      <FallingCircles />
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
        <Pressable onPress={goToWelcome} className="flex-row items-center mb-3" hitSlop={8}>
          <Text className="text-xl text-brand-500">‹</Text>
          <Text className="text-sm text-brand-500 ml-1">Panel inicial</Text>
        </Pressable>

        <View className="flex-row items-center mb-1">
          <View
            style={{ width: 8, height: 24, borderRadius: 4, backgroundColor: "#ecc6ff", marginRight: 8 }}
          />
          <Text className="text-2xl font-bold text-surface-dark dark:text-white">Mi Resumen</Text>
        </View>
        <Text className="text-sm text-gray-500 mb-4">Todo lo que registraste, en una vista.</Text>
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
  const { lang } = useT();

  // Compartir/descargar el wrapped no es gratis: Free no puede ninguno, So
  // Basic! solo el mensual, Diva los tres (semanal/mensual/anual).
  const canShareThisPeriod = tier === "full" || (tier === "basico" && period === "monthly");

  // Ver el resumen anual completo es exclusivo de Diva — So Basic! (y Free,
  // que ya está bloqueado más arriba por el PremiumGate) solo ven semanal y
  // mensual.
  const canViewPeriod = (p: ResumenPeriod) => p !== "yearly" || tier === "full";

  function showPeriodLockedMessage() {
    Alert.alert(
      "Es contenido premium",
      "¡Vuélvete una Diva para poder ver tu resumen anual!"
    );
  }

  function showShareLockedMessage() {
    if (period === "monthly") {
      Alert.alert(
        "Es contenido premium",
        "Revisa nuestros planes premium para poder compartir tu resumen mensual."
      );
    } else {
      Alert.alert(
        "Es contenido premium",
        `¡Vuélvete una Diva para poder compartir tu resumen ${PERIOD_ADJECTIVE[period]}!`
      );
    }
  }

  const cardRef = useRef<View>(null);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [pendingNetwork, setPendingNetwork] = useState<ShareNetwork | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  async function grantShareBonus() {
    if (!isFull) return;
    try {
      await grantMooneyForResumen(periodKey);
    } catch (error) {
      console.warn("grant_mooney_for_resumen falló", error);
    }
  }

  async function handleSelectNetwork(network: ShareNetwork) {
    setPendingNetwork(network);
    try {
      const imageUri = await captureCardImage(cardRef);
      await shareToNetwork(network, imageUri, "Mi Resumen de StayCoolPlus 💜");
      await grantShareBonus();
    } catch (error) {
      Alert.alert("No se pudo compartir", error instanceof Error ? error.message : "Intenta de nuevo.");
    } finally {
      setPendingNetwork(null);
      setShareSheetVisible(false);
    }
  }

  async function handleMoreOptions() {
    setPendingNetwork("whatsapp"); // reutilizamos el estado de "cargando" mientras se captura
    try {
      const imageUri = await captureCardImage(cardRef);
      await shareGeneric(imageUri, "Mi Resumen de StayCoolPlus 💜");
      await grantShareBonus();
    } catch (error) {
      Alert.alert("No se pudo compartir", error instanceof Error ? error.message : "Intenta de nuevo.");
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
      Alert.alert("No se pudo generar el PDF", error instanceof Error ? error.message : "Intenta de nuevo.");
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
            style={period === tab.id ? { backgroundColor: "#ecc6ff" } : undefined}
            className="flex-1 py-2 rounded-card items-center"
          >
            <Text
              className={
                period === tab.id ? "font-bold" : "text-gray-500 dark:text-gray-400"
              }
              style={period === tab.id ? { color: "#002054" } : undefined}
            >
              {canViewPeriod(tab.id) ? tab.label : `🔒 ${tab.label}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator color="#002054" size="large" />
        </View>
      ) : isError || !data ? (
        <Card className="items-center py-8">
          <Text className="text-gray-500">No pudimos cargar tu resumen. Intenta de nuevo.</Text>
        </Card>
      ) : periodStillOngoing ? (
        <Card className="items-center py-10 px-6">
          <Image
            source={require("../../../../assets/images/troste.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Text className="text-base font-bold text-surface-dark dark:text-white text-center mt-3">
            Aún no podemos darte esa información
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Tu resumen {PERIOD_ADJECTIVE[period]} va a estar disponible recién cuando termines{" "}
            {period === "monthly" ? "el mes" : "el año"}. Mantente Cool completando tus datos día a día en la
            app para llegar a tu Resumen— mientras tanto, puedes ver cómo va tu {PERIOD_UNIT.weekly} en la pestaña Semanal.
          </Text>
        </Card>
      ) : !hasAnyResumenData(data) ? (
        <Card className="items-center py-10 px-6">
          <Text style={{ fontSize: 36 }}>✨</Text>
          <Text className="text-base font-bold text-surface-dark dark:text-white text-center mt-3">
            Aún no tenemos datos suficientes para armar tu resumen
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            El resumen lo creas tu: completa tus datos día a día en cada módulo (Bienestar, Cuidado
            Personal, Imagen, Pelo, Social, Gastos...) y a medida que registres, acá vas a ver tu
            historia armarse sola.
          </Text>
        </Card>
      ) : (
        <>
          <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
            Acá está tu resumen {PERIOD_ADJECTIVE[period]}
            {data.displayName ? `, ${data.displayName}` : ""} ✨
          </Text>

          {/* Dashboard navegable in-app, en frases por módulo */}
          <View className="gap-3 mb-6">
            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Bienestar: </Text>
                Comiste {data.bienestar.mealsCount}{" "}
                {data.bienestar.mealsCount === 1 ? "vez" : "veces"}, dormiste un promedio de{" "}
                {formatSleep(data.bienestar.avgSleepMinutes)} y te ejercitaste{" "}
                {data.bienestar.exerciseCount}{" "}
                {data.bienestar.exerciseCount === 1 ? "vez" : "veces"}.
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Higiene: </Text>
                Cumpliste el {data.higiene.completionPercent}% de tu checklist
                {data.comparison.hygieneCompletionPercentDelta !== 0
                  ? ` (${data.comparison.hygieneCompletionPercentDelta > 0 ? "+" : ""}${
                      data.comparison.hygieneCompletionPercentDelta
                    } pts vs. el período anterior)`
                  : ""}
                .
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Pelo: </Text>
                Te lavaste el pelo {data.pelo.washCount}{" "}
                {data.pelo.washCount === 1 ? "vez" : "veces"} y probaste{" "}
                {data.pelo.distinctHairstylesCount}{" "}
                {data.pelo.distinctHairstylesCount === 1 ? "peinado distinto" : "peinados distintos"}.
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Cara: </Text>
                Te maquillaste {data.cara.makeupDays}{" "}
                {data.cara.makeupDays === 1 ? "día" : "días"}.
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Imagen: </Text>
                Registraste {data.imagen.outfitsCount}{" "}
                {data.imagen.outfitsCount === 1 ? "outfit" : "outfits"}.
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Actividades sociales: </Text>
                Saliste {data.social.activitiesCount}{" "}
                {data.social.activitiesCount === 1 ? "vez" : "veces"}
                {data.social.avgFeelingLabel
                  ? `, y en promedio te sentiste "${data.social.avgFeelingLabel}"`
                  : ""}
                .
              </Text>
            </Card>

            <Card style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
              <Text className="text-surface-dark dark:text-white">
                <Text className="font-bold">Gastos: </Text>
                Gastaste ${data.gastos.total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}.
              </Text>
              {Object.entries(data.gastos.breakdown).map(([kind, amount]) => (
                <Text key={kind} className="text-xs text-gray-400 mt-1">
                  {kind}: ${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </Text>
              ))}
            </Card>
          </View>

          {/* Tarjeta compartible (capturada off-screen para el share/no se
              recorta la vista visible del dashboard) */}
          <Text className="text-sm text-gray-500 mb-2">Vista previa de la tarjeta</Text>
          <View className="items-center mb-6">
            <ResumenCard ref={cardRef} data={data} period={period} />
          </View>

          <View className="gap-3">
            <Pressable
              onPress={canShareThisPeriod ? () => setShareSheetVisible(true) : showShareLockedMessage}
              className="rounded-full px-5 py-3.5 items-center justify-center"
              style={{ backgroundColor: "#ecc6ff" }}
            >
              <Text className="font-semibold text-base" style={{ color: "#002054" }}>
                {canShareThisPeriod ? "Compartir" : "🔒 Compartir"}
              </Text>
            </Pressable>
            <Button
              label={
                !canShareThisPeriod
                  ? "🔒 Descargar PDF"
                  : isExportingPdf
                  ? "Generando PDF..."
                  : "Descargar PDF"
              }
              variant="ghost"
              loading={canShareThisPeriod && isExportingPdf}
              onPress={canShareThisPeriod ? handleDownloadPdf : showShareLockedMessage}
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

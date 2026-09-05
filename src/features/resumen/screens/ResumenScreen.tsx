import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PremiumGate } from "@/features/premium/components/PremiumGate";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useResumenData, useResumenPeriod, useResumenPeriodKey } from "@/features/resumen/hooks/useResumen";
import { ResumenCard } from "@/features/resumen/components/ResumenCard";
import { ShareSheet } from "@/features/resumen/components/ShareSheet";
import { captureCardImage, shareGeneric, shareToNetwork, type ShareNetwork } from "@/features/resumen/services/shareService";
import { generateAndSharePdf } from "@/features/resumen/services/pdfService";
import { grantMooneyForResumen } from "@/features/premium/services/mooneyService";
import type { ResumenPeriod } from "@/features/resumen/types";

const PERIOD_TABS: { id: ResumenPeriod; label: string }[] = [
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
  { id: "yearly", label: "Anual" },
];

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  return `${(minutes / 60).toFixed(1)}h`;
}

export function ResumenScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark">
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-1">Mi Resumen</Text>
        <Text className="text-sm text-gray-500 mb-4">Todo lo que registraste, en una vista.</Text>
        <PremiumGate minTier="basico">
          <ResumenContent />
        </PremiumGate>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResumenContent() {
  const { period, setPeriod } = useResumenPeriod("monthly");
  const { data, isLoading, isError } = useResumenData(period);
  const periodKey = useResumenPeriodKey(period);
  const { isFull } = usePremium();

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
      await shareToNetwork(network, imageUri, "Mi Resumen de Agenda Cool+ 💜");
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
      await shareGeneric(imageUri, "Mi Resumen de Agenda Cool+ 💜");
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
      await generateAndSharePdf(data, period);
      await grantShareBonus();
    } catch (error) {
      Alert.alert("No se pudo generar el PDF", error instanceof Error ? error.message : "Intenta de nuevo.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <View>
      <View className="flex-row bg-white dark:bg-surface-cardDark rounded-card p-1 mb-4">
        {PERIOD_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setPeriod(tab.id)}
            className={`flex-1 py-2 rounded-card items-center ${period === tab.id ? "bg-brand-500" : ""}`}
          >
            <Text className={period === tab.id ? "text-white font-semibold" : "text-gray-500 dark:text-gray-400"}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator color="#b825f2" size="large" />
        </View>
      ) : isError || !data ? (
        <Card className="items-center py-8">
          <Text className="text-gray-500">No pudimos cargar tu resumen. Intenta de nuevo.</Text>
        </Card>
      ) : (
        <>
          {/* Dashboard navegable in-app */}
          <View className="gap-3 mb-6">
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Higiene</Text>
              <Text className="text-2xl font-bold text-brand-500">{data.higiene.completionPercent}%</Text>
              <Text className="text-xs text-gray-400">
                cumplimiento del checklist{" "}
                {data.comparison.hygieneCompletionPercentDelta !== 0
                  ? `· ${data.comparison.hygieneCompletionPercentDelta > 0 ? "+" : ""}${
                      data.comparison.hygieneCompletionPercentDelta
                    } pts vs. período anterior`
                  : ""}
              </Text>
            </Card>
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Bienestar</Text>
              <Text className="text-surface-dark dark:text-white">
                {formatSleep(data.bienestar.avgSleepMinutes)} sueño promedio · {data.bienestar.mealsCount} comidas ·{" "}
                {data.bienestar.exerciseCount} sesiones de ejercicio
              </Text>
            </Card>
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Pelo</Text>
              <Text className="text-surface-dark dark:text-white">
                {data.pelo.washCount} lavados · {data.pelo.distinctHairstylesCount} peinados distintos
              </Text>
            </Card>
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Cara</Text>
              <Text className="text-surface-dark dark:text-white">{data.cara.makeupDays} días maquillada</Text>
            </Card>
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Imagen</Text>
              <Text className="text-surface-dark dark:text-white">{data.imagen.outfitsCount} outfits registrados</Text>
            </Card>
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Actividades Sociales</Text>
              <Text className="text-surface-dark dark:text-white">
                {data.social.activitiesCount} salidas
                {data.social.avgFeelingLabel ? ` · te sentiste "${data.social.avgFeelingLabel}" en promedio` : ""}
              </Text>
            </Card>
            <Card>
              <Text className="text-sm text-gray-500 mb-1">Gastos</Text>
              <Text className="text-xl font-bold text-brand-500">
                ${data.gastos.total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </Text>
              {Object.entries(data.gastos.breakdown).map(([kind, amount]) => (
                <Text key={kind} className="text-xs text-gray-400">
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
            <Button label="Compartir" onPress={() => setShareSheetVisible(true)} />
            <Button
              label={isExportingPdf ? "Generando PDF..." : "Descargar PDF"}
              variant="ghost"
              loading={isExportingPdf}
              onPress={handleDownloadPdf}
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

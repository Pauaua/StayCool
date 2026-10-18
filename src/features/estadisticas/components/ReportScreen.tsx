import React, { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { colors } from "@/theme";
import { Heading } from "@/components/ui/Heading";
import { format, parseISO, type Locale } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { useReport } from "@/features/estadisticas/hooks/useEstadisticas";
import { ReportView } from "@/features/estadisticas/components/ReportView";
import {
  canGoForward,
  latestPeriod,
  pendingCurrentPeriod,
  shiftPeriod,
  type Period,
  type ReportKind,
} from "@/features/estadisticas/logic/periods";
import { useT, type TranslationKey } from "@/lib/i18n";

function periodLabel(
  period: Period,
  now: Date,
  locale: Locale,
  lang: "es" | "en",
  t: ReturnType<typeof useT>["t"]
): string {
  const from = parseISO(period.from);
  const to = parseISO(period.to);
  switch (period.kind) {
    case "day":
      return format(from, lang === "en" ? "EEEE, MMMM d, yyyy" : "EEEE d 'de' MMMM yyyy", { locale });
    case "week":
      return `${format(from, "d MMM", { locale })} – ${format(to, "d MMM yyyy", { locale })}`;
    case "month":
      return format(from, "MMMM yyyy", { locale });
    case "year":
      return from.getFullYear() === now.getFullYear()
        ? t("stats.yearToDate", { year: String(from.getFullYear()) })
        : String(from.getFullYear());
  }
}

// Pantalla común de los informes (Hoy, Semanal, Mensual, Anual): elige el
// periodo, permite ir a periodos anteriores y muestra el informe.
export function ReportScreen({
  kind,
  titleKey,
  onBack,
}: {
  kind: ReportKind;
  titleKey: TranslationKey;
  onBack: () => void;
}) {
  const { t, lang } = useT();
  const locale = lang === "en" ? enUS : es;
  const now = useMemo(() => new Date(), []);
  const latest = useMemo(() => latestPeriod(kind, now), [kind, now]);
  const [period, setPeriod] = useState<Period>(latest);
  const { data: report, isLoading, isError, refetch } = useReport(period);

  const isLatest = period.from === latest.from;
  const pending = isLatest ? pendingCurrentPeriod(kind, now) : null;
  const forwardEnabled = canGoForward(period, now);
  // Si el periodo incluye hoy, las frases dicen "esta semana"; si es uno
  // pasado, "esa semana".
  const todayIso = format(now, "yyyy-MM-dd");
  const isCurrent = period.from <= todayIso && period.to >= todayIso;

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={onBack} className="flex-row items-center mb-2" hitSlop={8}>
          <Text className="text-xl text-ink">‹</Text>
          <Text className="text-sm text-ink ml-1">{t("estadisticas.back")}</Text>
        </Pressable>

        <View className="flex-row items-center mb-2">
          <Image
            source={require("../../../../assets/images/estadisticas.png")}
            style={{ width: 48, height: 48, marginRight: 8 }}
            resizeMode="contain"
          />
          <Heading className="text-2xl">{t(titleKey)}</Heading>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => setPeriod(shiftPeriod(period, -1, now))} hitSlop={12}>
            <Text className="text-2xl text-ink px-2">‹</Text>
          </Pressable>
          <Text className="text-base font-semibold text-surface-dark dark:text-white text-center flex-1">
            {periodLabel(period, now, locale, lang, t)}
          </Text>
          <Pressable
            onPress={() => forwardEnabled && setPeriod(shiftPeriod(period, 1, now))}
            hitSlop={12}
            disabled={!forwardEnabled}
          >
            <Text className="text-2xl text-ink px-2" style={{ opacity: forwardEnabled ? 1 : 0.2 }}>
              ›
            </Text>
          </Pressable>
        </View>

        {pending ? (
          <Card className="mb-4" style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
            <Text className="text-sm text-surface-dark dark:text-white">
              {t(kind === "week" ? "stats.pending.week" : "stats.pending.month", {
                date: format(parseISO(pending.to), lang === "en" ? "MMMM d" : "d 'de' MMMM", { locale }),
              })}
            </Text>
          </Card>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={colors.ink} className="mt-8" />
        ) : isError || !report ? (
          <Pressable onPress={() => refetch()}>
            <Card className="items-center py-8">
              <Text className="text-gray-500 text-center">{t("stats.loadError")}</Text>
              <Text className="text-ink mt-2">{t("paywall.retry")}</Text>
            </Card>
          </Pressable>
        ) : !report.hasData ? (
          <Card className="items-center py-8">
            <Text className="text-gray-500 text-center">{t("stats.noData")}</Text>
          </Card>
        ) : (
          <ReportView report={report} isCurrent={isCurrent} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

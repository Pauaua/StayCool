import React, { forwardRef } from "react";
import { Dimensions, Text, View } from "react-native";
import { colors, fonts } from "@/theme";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { ResumenData, ResumenPeriod } from "@/features/resumen/types";

const CARD_WIDTH = Math.min(Dimensions.get("window").width * 0.86, 340);
const CARD_HEIGHT = CARD_WIDTH * (1920 / 1080);

const PERIOD_UNIT_KEY: Record<ResumenPeriod, TranslationKey> = {
  weekly: "resumen.period.weeklyUnit",
  monthly: "resumen.period.monthlyUnit",
  yearly: "resumen.period.yearlyUnit",
};

// Manual de marca: fondo pastel sólido con texto oscuro.
const COLORS = {
  ink: colors.ink,
  inkMuted: "rgba(18,16,22,0.65)",
  background: colors.rosado,
  hairline: "rgba(18,16,22,0.12)",
};

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}.${Math.round((mins / 60) * 10)}h`;
}

function Line({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingVertical: CARD_HEIGHT * 0.015,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.hairline,
      }}
    >
      <Text style={{ fontSize: 12.5, lineHeight: 17, color: COLORS.ink, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

interface ResumenCardProps {
  data: ResumenData;
  period: ResumenPeriod;
}

// Tarjeta compartible tipo "wrapped" (Spotify Wrapped, pero con los datos de
// la usuaria), capturada con react-native-view-shot vía la ref que se le
// pasa a este componente. Proporción 1080x1920 (historia de Instagram).
export const ResumenCard = forwardRef<View, ResumenCardProps>(({ data, period }, ref) => {
  const { t } = useT();
  const periodWord = t(PERIOD_UNIT_KEY[period]);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1, padding: CARD_WIDTH * 0.085, backgroundColor: COLORS.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 14, color: COLORS.ink, textTransform: "uppercase" }}>
            StayCool<Text style={{ color: COLORS.ink }}>+</Text>
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: COLORS.ink,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: "700", color: COLORS.ink, letterSpacing: 1 }}>
              {t("resumenCard.wrappedLabel", { period: periodWord.toUpperCase() })}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: CARD_HEIGHT * 0.05 }}>
          <Text style={{ fontSize: 9, fontWeight: "700", color: COLORS.inkMuted, letterSpacing: 1.5 }}>
            {data.displayName
              ? t("resumenCard.eyebrowWithName", { period: periodWord.toUpperCase(), name: data.displayName.toUpperCase() })
              : t("resumenCard.eyebrowNoName", { period: periodWord.toUpperCase() })}
          </Text>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 24,
              color: COLORS.ink,
              lineHeight: 28,
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {t("resumenCard.heading", { period: periodWord })}
          </Text>
        </View>

        <View style={{ marginTop: CARD_HEIGHT * 0.06, flex: 1 }}>
          <Line
            text={t("resumenCard.line.bienestar", {
              n: String(data.bienestar.exerciseCount),
              word: t(data.bienestar.exerciseCount === 1 ? "estadisticas.word.dia" : "estadisticas.word.dias"),
              sleep: formatSleep(data.bienestar.avgSleepMinutes),
            })}
          />
          <Line
            text={t("resumenCard.line.cara", {
              n: String(data.cara.makeupDays),
              word: t(data.cara.makeupDays === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
            })}
          />
          <Line text={t("resumenCard.line.higiene", { percent: String(data.higiene.completionPercent) })} />
          <Line
            text={t("resumenCard.line.pelo", {
              n: String(data.pelo.washCount),
              word: t(data.pelo.washCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
              styles: String(data.pelo.distinctHairstylesCount),
              styleWord: t(
                data.pelo.distinctHairstylesCount === 1 ? "estadisticas.word.peinado" : "estadisticas.word.peinados"
              ),
            })}
          />
          <Line
            text={t("resumenCard.line.imagen", {
              n: String(data.imagen.outfitsCount),
              word: t(data.imagen.outfitsCount === 1 ? "estadisticas.word.outfit" : "estadisticas.word.outfits"),
            })}
          />
          <Line
            text={t("resumenCard.line.social", {
              n: String(data.social.activitiesCount),
              word: t(data.social.activitiesCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
              feeling: data.social.avgFeelingLabel
                ? t("resumenCard.socialFeeling", { feeling: data.social.avgFeelingLabel })
                : "",
            })}
          />
        </View>

        <View
          style={{
            marginTop: "auto",
            paddingTop: CARD_HEIGHT * 0.03,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 8, color: COLORS.inkMuted, fontWeight: "600" }}>
            {t("resumenCard.generatedInPrefix")}{" "}
            <Text style={{ color: COLORS.ink, fontWeight: "800" }}>StayCoolPlus</Text>
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.ink, opacity: 0.4 }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
});
ResumenCard.displayName = "ResumenCard";

import React, { forwardRef } from "react";
import { Dimensions, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ResumenData, ResumenPeriod } from "@/features/resumen/types";

const CARD_WIDTH = Math.min(Dimensions.get("window").width * 0.86, 340);
const CARD_HEIGHT = CARD_WIDTH * (1920 / 1080);

const PERIOD_LABEL: Record<ResumenPeriod, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

const COLORS = {
  purple300: "#e485ff",
  purple900: "#3a0a52",
  ink950: "#121016",
  teal: "#14e0c4",
  coral: "#ff6b6b",
  amber: "#ffb454",
  paper: "#fdf2ff",
  inkMuted: "#b7a6c4",
  hairline: "rgba(255,255,255,0.09)",
};

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}.${Math.round((mins / 60) * 10)}h`;
}

function formatMoney(amount: number) {
  if (amount >= 1000) return `$${Math.round(amount / 1000)}k`;
  return `$${Math.round(amount)}`;
}

function Row({
  accent,
  name,
  detail,
  value,
  last,
}: {
  accent: string;
  name: string;
  detail: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingVertical: CARD_HEIGHT * 0.017,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: COLORS.hairline,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, fontWeight: "600", color: COLORS.inkMuted }}>{name}</Text>
        <Text style={{ fontSize: 8.5, color: COLORS.inkMuted, opacity: 0.75, marginTop: 2 }}>{detail}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "800", color: COLORS.paper }}>{value}</Text>
    </View>
  );
}

interface ResumenCardProps {
  data: ResumenData;
  period: ResumenPeriod;
}

// Tarjeta compartible, capturada con react-native-view-shot vía la ref que
// se le pasa a este componente. Proporción 1080x1920 (historia de
// Instagram); el diseño replica el boceto aprobado (lista editorial de
// módulos, hero con el stat más presumible, footer de marca).
export const ResumenCard = forwardRef<View, ResumenCardProps>(({ data, period }, ref) => {
  const socialTypesCount = Object.keys(data.social.typeBreakdown).length;
  const topGastoEntry = Object.entries(data.gastos.breakdown).sort((a, b) => b[1] - a[1])[0];

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
      <LinearGradient
        colors={[COLORS.purple900, COLORS.ink950, "#0a0810"]}
        locations={[0, 0.46, 1]}
        style={{ flex: 1, padding: CARD_WIDTH * 0.085 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 5,
                backgroundColor: COLORS.purple300,
              }}
            />
            <Text style={{ fontSize: 9.5, fontWeight: "700", color: COLORS.paper }}>
              Agenda Cool<Text style={{ color: COLORS.purple300, fontWeight: "800" }}>+</Text>
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: "600", color: COLORS.inkMuted, letterSpacing: 1 }}>
              {PERIOD_LABEL[period].toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: CARD_HEIGHT * 0.045 }}>
          <Text style={{ fontSize: 8.5, fontWeight: "700", color: COLORS.purple300, letterSpacing: 1.5 }}>
            MI RESUMEN
          </Text>
          <Text
            style={{
              fontSize: 19,
              fontWeight: "700",
              color: COLORS.paper,
              lineHeight: 24,
              marginTop: 6,
            }}
          >
            {data.higiene.completionPercent >= 70 ? "Un período con " : "Vas construyendo tu "}
            <Text style={{ fontWeight: "800", color: COLORS.teal }}>
              {data.higiene.completionPercent >= 70 ? "ritmo propio" : "propio ritmo"}
            </Text>
          </Text>
        </View>

        <View style={{ marginTop: CARD_HEIGHT * 0.055, flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
          <View>
            <Text style={{ fontSize: 44, fontWeight: "800", color: COLORS.paper, letterSpacing: -1 }}>
              {data.higiene.completionPercent}%
            </Text>
            <Text style={{ fontSize: 9.5, color: COLORS.inkMuted, marginTop: 6 }}>
              cumplimiento de higiene
            </Text>
          </View>
          {data.comparison.hygieneCompletionPercentDelta !== 0 ? (
            <View
              style={{
                backgroundColor: data.comparison.hygieneCompletionPercentDelta > 0
                  ? "rgba(20,224,196,0.16)"
                  : "rgba(255,107,107,0.16)",
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: data.comparison.hygieneCompletionPercentDelta > 0 ? COLORS.teal : COLORS.coral,
                }}
              >
                {data.comparison.hygieneCompletionPercentDelta > 0 ? "▲" : "▼"}{" "}
                {Math.abs(data.comparison.hygieneCompletionPercentDelta)} pts
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: CARD_HEIGHT * 0.06, flex: 1 }}>
          <Row
            accent={COLORS.teal}
            name="Bienestar"
            detail={`${data.bienestar.exerciseCount} sesiones de ejercicio`}
            value={`${formatSleep(data.bienestar.avgSleepMinutes)} sueño`}
          />
          <Row
            accent={COLORS.purple300}
            name="Pelo"
            detail={`${data.pelo.distinctHairstylesCount} peinados distintos`}
            value={`${data.pelo.washCount} lavados`}
          />
          <Row
            accent={COLORS.coral}
            name="Cara"
            detail="días con maquillaje"
            value={`${data.cara.makeupDays} días`}
          />
          <Row
            accent={COLORS.purple300}
            name="Imagen"
            detail="outfits registrados"
            value={`${data.imagen.outfitsCount} outfits`}
          />
          <Row
            accent={COLORS.teal}
            name="Social"
            detail={
              data.social.avgFeelingLabel
                ? `te sentiste "${data.social.avgFeelingLabel}" en promedio`
                : `${socialTypesCount} tipos de salida`
            }
            value={`${data.social.activitiesCount} salidas`}
          />
          <Row
            accent={COLORS.amber}
            name="Gastos"
            detail={topGastoEntry ? `mayor gasto: ${topGastoEntry[0]}` : "sin registros"}
            value={`${formatMoney(data.gastos.total)} total`}
            last
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
            Generado en <Text style={{ color: COLORS.paper }}>Agenda Cool+</Text>
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.purple300, opacity: 0.5 }}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});
ResumenCard.displayName = "ResumenCard";

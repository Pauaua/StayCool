import React from "react";
import { ScrollView, Text, View } from "react-native";

export interface BarChartDatum {
  label: string;
  value: number;
}

// Gráfico de barras simple hecho con Views (sin librerías de charting) —
// suficiente para las vistas semanales/mensuales de Bienestar y evita sumar
// una dependencia pesada solo para un vistazo rápido de tendencias.
export function BarChart({
  data,
  unit,
  barColor = "#b825f2",
  height = 140,
}: {
  data: BarChartDatum[];
  unit?: string;
  barColor?: string;
  height?: number;
}) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row items-end" style={{ height: height + 32 }}>
        {data.map((d, index) => (
          <View key={`${d.label}-${index}`} className="items-center mx-1.5" style={{ width: 32 }}>
            <Text className="text-[10px] text-gray-500 mb-1">
              {d.value > 0 ? `${d.value}${unit ?? ""}` : ""}
            </Text>
            <View
              style={{
                height: Math.max(2, (d.value / maxValue) * height),
                width: 18,
                backgroundColor: barColor,
                borderRadius: 6,
              }}
            />
            <Text className="text-[10px] text-gray-400 mt-1">{d.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

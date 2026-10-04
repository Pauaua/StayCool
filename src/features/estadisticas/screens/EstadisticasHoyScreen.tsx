import React from "react";
import { ReportScreen } from "@/features/estadisticas/components/ReportScreen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasHoy">;

export function EstadisticasHoyScreen({ navigation }: Props) {
  return <ReportScreen kind="day" titleKey="estadisticas.todayTitle" onBack={() => navigation.goBack()} />;
}

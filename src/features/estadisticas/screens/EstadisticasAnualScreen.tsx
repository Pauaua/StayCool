import React from "react";
import { ReportScreen } from "@/features/estadisticas/components/ReportScreen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasAnual">;

export function EstadisticasAnualScreen({ navigation }: Props) {
  return <ReportScreen kind="year" titleKey="estadisticas.yearlyTitle" onBack={() => navigation.goBack()} />;
}

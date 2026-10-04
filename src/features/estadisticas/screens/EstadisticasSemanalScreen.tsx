import React from "react";
import { ReportScreen } from "@/features/estadisticas/components/ReportScreen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasSemanal">;

export function EstadisticasSemanalScreen({ navigation }: Props) {
  return <ReportScreen kind="week" titleKey="estadisticas.weeklyTitle" onBack={() => navigation.goBack()} />;
}

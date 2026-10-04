import React from "react";
import { ReportScreen } from "@/features/estadisticas/components/ReportScreen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasMensual">;

export function EstadisticasMensualScreen({ navigation }: Props) {
  return <ReportScreen kind="month" titleKey="estadisticas.monthlyTitle" onBack={() => navigation.goBack()} />;
}

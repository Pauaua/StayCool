import React from "react";
import { useT } from "@/lib/i18n";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GastosHomeScreen } from "@/features/gastos/screens/GastosHomeScreen";
import { GastoRapidoScreen } from "@/features/gastos/screens/GastoRapidoScreen";
import { GastoDetalladoScreen } from "@/features/gastos/screens/GastoDetalladoScreen";
import { GastoDetalleScreen } from "@/features/gastos/screens/GastoDetalleScreen";
import type { GastosStackParamList } from "@/navigation/types";
import { sectionScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<GastosStackParamList>();

export function GastosNavigator() {
  const { t } = useT();
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={sectionScreenOptions("Gastos")}>
        <Stack.Screen name="GastosHome" component={GastosHomeScreen} />
        <Stack.Screen
          name="GastoRapido"
          component={GastoRapidoScreen}
          options={{ headerShown: true, title: t("nav.quickExpense") }}
        />
        <Stack.Screen
          name="GastoDetallado"
          component={GastoDetalladoScreen}
          options={{ headerShown: true, title: t("nav.bigExpense") }}
        />
        <Stack.Screen
          name="GastoDetalle"
          component={GastoDetalleScreen}
          options={{ headerShown: true, title: t("nav.expenseDetail") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

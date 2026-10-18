import React from "react";
import { useT } from "@/lib/i18n";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GustosHomeScreen } from "@/features/gustos/screens/GustosHomeScreen";
import { GustoRapidoScreen } from "@/features/gustos/screens/GustoRapidoScreen";
import { GustoDetalladoScreen } from "@/features/gustos/screens/GustoDetalladoScreen";
import type { GustosStackParamList } from "@/navigation/types";
import { sectionScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<GustosStackParamList>();

export function GustosNavigator() {
  const { t } = useT();
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={sectionScreenOptions("Gustos")}>
        <Stack.Screen name="GustosHome" component={GustosHomeScreen} />
        <Stack.Screen
          name="GustoRapido"
          component={GustoRapidoScreen}
          options={{ headerShown: true, title: t("nav.quickLog") }}
        />
        <Stack.Screen
          name="GustoDetallado"
          component={GustoDetalladoScreen}
          options={{ headerShown: true, title: t("nav.detailedLog") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

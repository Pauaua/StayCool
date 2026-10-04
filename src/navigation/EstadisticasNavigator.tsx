import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { EstadisticasHomeScreen } from "@/features/estadisticas/screens/EstadisticasHomeScreen";
import { EstadisticasHoyScreen } from "@/features/estadisticas/screens/EstadisticasHoyScreen";
import { EstadisticasSemanalScreen } from "@/features/estadisticas/screens/EstadisticasSemanalScreen";
import { EstadisticasMensualScreen } from "@/features/estadisticas/screens/EstadisticasMensualScreen";
import { EstadisticasAnualScreen } from "@/features/estadisticas/screens/EstadisticasAnualScreen";
import { PaywallScreen } from "@/features/premium/screens/PaywallScreen";
import type { EstadisticasStackParamList } from "@/navigation/types";
import { defaultScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<EstadisticasStackParamList>();

export function EstadisticasNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
        <Stack.Screen name="EstadisticasHome" component={EstadisticasHomeScreen} />
        <Stack.Screen name="EstadisticasHoy" component={EstadisticasHoyScreen} />
        <Stack.Screen name="EstadisticasSemanal" component={EstadisticasSemanalScreen} />
        <Stack.Screen name="EstadisticasMensual" component={EstadisticasMensualScreen} />
        <Stack.Screen name="EstadisticasAnual" component={EstadisticasAnualScreen} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ headerShown: true, title: "StayCoolPlus" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

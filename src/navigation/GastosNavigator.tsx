import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GastosHomeScreen } from "@/features/gastos/screens/GastosHomeScreen";
import { GastoRapidoScreen } from "@/features/gastos/screens/GastoRapidoScreen";
import { GastoDetalladoScreen } from "@/features/gastos/screens/GastoDetalladoScreen";
import { GastoDetalleScreen } from "@/features/gastos/screens/GastoDetalleScreen";
import type { GastosStackParamList } from "@/navigation/types";
import { defaultScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<GastosStackParamList>();

export function GastosNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
        <Stack.Screen name="GastosHome" component={GastosHomeScreen} />
        <Stack.Screen
          name="GastoRapido"
          component={GastoRapidoScreen}
          options={{ headerShown: true, title: "Gasto rápido" }}
        />
        <Stack.Screen
          name="GastoDetallado"
          component={GastoDetalladoScreen}
          options={{ headerShown: true, title: "Gasto grande" }}
        />
        <Stack.Screen
          name="GastoDetalle"
          component={GastoDetalleScreen}
          options={{ headerShown: true, title: "Detalle del gasto" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

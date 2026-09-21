import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GustosHomeScreen } from "@/features/gustos/screens/GustosHomeScreen";
import { GustoRapidoScreen } from "@/features/gustos/screens/GustoRapidoScreen";
import { GustoDetalladoScreen } from "@/features/gustos/screens/GustoDetalladoScreen";
import type { GustosStackParamList } from "@/navigation/types";
import { defaultScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<GustosStackParamList>();

export function GustosNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
        <Stack.Screen name="GustosHome" component={GustosHomeScreen} />
        <Stack.Screen
          name="GustoRapido"
          component={GustoRapidoScreen}
          options={{ headerShown: true, title: "Registro rápido" }}
        />
        <Stack.Screen
          name="GustoDetallado"
          component={GustoDetalladoScreen}
          options={{ headerShown: true, title: "Registro detallado" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

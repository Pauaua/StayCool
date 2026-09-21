import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NotasHomeScreen } from "@/features/notas/screens/NotasHomeScreen";
import { NotaRapidaScreen } from "@/features/notas/screens/NotaRapidaScreen";
import { NotaDetalladaScreen } from "@/features/notas/screens/NotaDetalladaScreen";
import type { NotasStackParamList } from "@/navigation/types";
import { defaultScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<NotasStackParamList>();

export function NotasNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
        <Stack.Screen name="NotasHome" component={NotasHomeScreen} />
        <Stack.Screen
          name="NotaRapida"
          component={NotaRapidaScreen}
          options={{ headerShown: true, title: "Idea rápida" }}
        />
        <Stack.Screen
          name="NotaDetallada"
          component={NotaDetalladaScreen}
          options={{ headerShown: true, title: "Idea completa" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

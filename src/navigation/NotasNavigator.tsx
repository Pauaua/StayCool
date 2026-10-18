import React from "react";
import { useT } from "@/lib/i18n";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NotasHomeScreen } from "@/features/notas/screens/NotasHomeScreen";
import { NotaRapidaScreen } from "@/features/notas/screens/NotaRapidaScreen";
import { NotaDetalladaScreen } from "@/features/notas/screens/NotaDetalladaScreen";
import type { NotasStackParamList } from "@/navigation/types";
import { sectionScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<NotasStackParamList>();

export function NotasNavigator() {
  const { t } = useT();
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={sectionScreenOptions("Notas")}>
        <Stack.Screen name="NotasHome" component={NotasHomeScreen} />
        <Stack.Screen
          name="NotaRapida"
          component={NotaRapidaScreen}
          options={{ headerShown: true, title: t("nav.quickIdea") }}
        />
        <Stack.Screen
          name="NotaDetallada"
          component={NotaDetalladaScreen}
          options={{ headerShown: true, title: t("nav.fullIdea") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { SettingsScreen } from "@/features/home/screens/SettingsScreen";
import { AvatarShopScreen } from "@/features/premium/screens/AvatarShopScreen";
import { PaywallScreen } from "@/features/premium/screens/PaywallScreen";
import { ResumenScreen } from "@/features/resumen/screens/ResumenScreen";
import { ConfiguracionScreen } from "@/features/home/screens/ConfiguracionScreen";
import type { HomeStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<HomeStackParamList>();

// `independent`: MainShell monta este navigator junto a los de los demás
// módulos al mismo tiempo (ocultos con display:none), y React Navigation no
// permite más de un navigator raíz por NavigationContainer — cada módulo
// necesita el suyo propio.
export function HomeNavigator({
  initialRouteName = "HomeDashboard",
}: {
  initialRouteName?: keyof HomeStackParamList;
}) {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
        <Stack.Screen name="HomeDashboard" component={HomeScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: "Ajustes" }}
        />
        <Stack.Screen
          name="AvatarShop"
          component={AvatarShopScreen}
          options={{ headerShown: true, title: "Personalizar avatar" }}
        />
        <Stack.Screen
          name="Resumen"
          component={ResumenScreen}
          options={{ headerShown: true, title: "Mi Resumen" }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ headerShown: true, title: "StayCoolPlus" }}
        />
        <Stack.Screen
          name="Configuracion"
          component={ConfiguracionScreen}
          options={{ headerShown: true, title: "Configuración" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { useT } from "@/lib/i18n";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { SettingsScreen } from "@/features/home/screens/SettingsScreen";
// Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
// import { AvatarShopScreen } from "@/features/premium/screens/AvatarShopScreen";
import { PaywallScreen } from "@/features/premium/screens/PaywallScreen";
import { ResumenScreen } from "@/features/resumen/screens/ResumenScreen";
import { ConfiguracionScreen } from "@/features/home/screens/ConfiguracionScreen";
import { LegalScreen } from "@/features/home/screens/LegalScreen";
import type { HomeStackParamList } from "@/navigation/types";
import { sectionScreenOptions } from "@/navigation/screenOptions";
import { useModuleNavigationRef } from "@/navigation/moduleNavigation";

const Stack = createNativeStackNavigator<HomeStackParamList>();

// `independent`: MainShell monta este navigator junto a los de los demás
// módulos al mismo tiempo (ocultos con display:none), y React Navigation no
// permite más de un navigator raíz por NavigationContainer — cada módulo
// necesita el suyo propio.
export function HomeNavigator({
  initialRouteName = "HomeDashboard",
  onRouteChange,
}: {
  initialRouteName?: keyof HomeStackParamList;
  // Avisa a MainShell la pantalla actual: en el panel principal no va rail.
  onRouteChange?: (route: string | undefined) => void;
}) {
  const { t } = useT();
  const navigationRef = useModuleNavigationRef("Home");
  const reportRoute = () => onRouteChange?.(navigationRef.getCurrentRoute()?.name);
  return (
    <NavigationContainer independent ref={navigationRef} onReady={reportRoute} onStateChange={reportRoute}>
      <Stack.Navigator screenOptions={sectionScreenOptions("Home")} initialRouteName={initialRouteName}>
        <Stack.Screen name="HomeDashboard" component={HomeScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: t("settings.title") }}
        />
        {/* Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
        <Stack.Screen
          name="AvatarShop"
          component={AvatarShopScreen}
          options={{ headerShown: true, title: t("settings.customizeAvatar") }}
        /> */}
        <Stack.Screen
          name="Resumen"
          component={ResumenScreen}
          options={{ headerShown: true, title: t("resumen.title") }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ headerShown: true, title: "StayCoolPlus" }}
        />
        <Stack.Screen
          name="Configuracion"
          component={ConfiguracionScreen}
          options={{ headerShown: true, title: t("welcome.settings") }}
        />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={{ headerShown: true, title: t("nav.legal") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

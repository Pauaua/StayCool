import React from "react";
import { useT } from "@/lib/i18n";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ImagenHomeScreen } from "@/features/imagen/screens/ImagenHomeScreen";
import { CaraSectionScreen } from "@/features/imagen/screens/CaraSectionScreen";
import { VestuarioHomeScreen } from "@/features/imagen/screens/VestuarioHomeScreen";
import { OutfitDetailScreen } from "@/features/imagen/screens/OutfitDetailScreen";
import { ZapatosHomeScreen } from "@/features/imagen/screens/ZapatosHomeScreen";
import { ShoeDetailScreen } from "@/features/imagen/screens/ShoeDetailScreen";
import { PeloHomeScreen } from "@/features/pelo/screens/PeloHomeScreen";
import { HairstyleDetailScreen } from "@/features/pelo/screens/HairstyleDetailScreen";
import { HairProfileScreen } from "@/features/pelo/screens/HairProfileScreen";
import type { ImagenStackParamList } from "@/navigation/types";
import { sectionScreenOptions } from "@/navigation/screenOptions";
import { useModuleNavigationRef } from "@/navigation/moduleNavigation";

const Stack = createNativeStackNavigator<ImagenStackParamList>();

export function ImagenNavigator() {
  const { t } = useT();
  const navigationRef = useModuleNavigationRef("Imagen");
  return (
    <NavigationContainer independent ref={navigationRef}>
      <Stack.Navigator screenOptions={sectionScreenOptions("Imagen")}>
        <Stack.Screen name="ImagenHome" component={ImagenHomeScreen} />
        <Stack.Screen
          name="CaraSection"
          component={CaraSectionScreen}
          options={{ headerShown: true, title: t("cara.title") }}
        />
        <Stack.Screen
          name="PeloHome"
          component={PeloHomeScreen}
          options={{ headerShown: true, title: t("pelo.title") }}
        />
        <Stack.Screen
          name="HairstyleDetail"
          component={HairstyleDetailScreen}
          options={{ headerShown: true, title: t("nav.hairstyle") }}
        />
        <Stack.Screen
          name="HairProfile"
          component={HairProfileScreen}
          options={{ headerShown: true, title: t("nav.hairProfile") }}
        />
        <Stack.Screen
          name="VestuarioHome"
          component={VestuarioHomeScreen}
          options={{ headerShown: true, title: t("vestuario.title") }}
        />
        <Stack.Screen
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={{ headerShown: true, title: t("nav.outfit") }}
        />
        <Stack.Screen
          name="ZapatosHome"
          component={ZapatosHomeScreen}
          options={{ headerShown: true, title: t("zapatos.title") }}
        />
        <Stack.Screen
          name="ShoeDetail"
          component={ShoeDetailScreen}
          options={{ headerShown: true, title: t("zapatos.title") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

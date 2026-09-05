import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ImagenHomeScreen } from "@/features/imagen/screens/ImagenHomeScreen";
import { CaraSectionScreen } from "@/features/imagen/screens/CaraSectionScreen";
import { VestuarioHomeScreen } from "@/features/imagen/screens/VestuarioHomeScreen";
import { OutfitDetailScreen } from "@/features/imagen/screens/OutfitDetailScreen";
import { ZapatosHomeScreen } from "@/features/imagen/screens/ZapatosHomeScreen";
import { ShoeDetailScreen } from "@/features/imagen/screens/ShoeDetailScreen";
import type { ImagenStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ImagenStackParamList>();

export function ImagenNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ImagenHome" component={ImagenHomeScreen} />
        <Stack.Screen
          name="CaraSection"
          component={CaraSectionScreen}
          options={{ headerShown: true, title: "Cara" }}
        />
        <Stack.Screen
          name="VestuarioHome"
          component={VestuarioHomeScreen}
          options={{ headerShown: true, title: "Vestuario" }}
        />
        <Stack.Screen
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={{ headerShown: true, title: "Outfit" }}
        />
        <Stack.Screen
          name="ZapatosHome"
          component={ZapatosHomeScreen}
          options={{ headerShown: true, title: "Zapatos" }}
        />
        <Stack.Screen
          name="ShoeDetail"
          component={ShoeDetailScreen}
          options={{ headerShown: true, title: "Zapatos" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PeloHomeScreen } from "@/features/pelo/screens/PeloHomeScreen";
import { HairstyleDetailScreen } from "@/features/pelo/screens/HairstyleDetailScreen";
import { HairProfileScreen } from "@/features/pelo/screens/HairProfileScreen";
import type { PeloStackParamList } from "@/navigation/types";
import { defaultScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<PeloStackParamList>();

export function PeloNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
        <Stack.Screen name="PeloHome" component={PeloHomeScreen} />
        <Stack.Screen
          name="HairstyleDetail"
          component={HairstyleDetailScreen}
          options={{ headerShown: true, title: "Peinado" }}
        />
        <Stack.Screen
          name="HairProfile"
          component={HairProfileScreen}
          options={{ headerShown: true, title: "Perfil de cabello" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SocialCalendarioScreen } from "@/features/social/screens/SocialCalendarioScreen";
import { SocialRegistroScreen } from "@/features/social/screens/SocialRegistroScreen";
import type { SocialStackParamList } from "@/navigation/types";
import { defaultScreenOptions } from "@/navigation/screenOptions";

const Stack = createNativeStackNavigator<SocialStackParamList>();

export function SocialNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
        <Stack.Screen name="SocialCalendario" component={SocialCalendarioScreen} />
        <Stack.Screen
          name="SocialRegistro"
          component={SocialRegistroScreen}
          options={{ headerShown: true, title: "Nueva actividad" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

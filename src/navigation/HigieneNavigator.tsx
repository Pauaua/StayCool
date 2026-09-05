import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HigieneHomeScreen } from "@/features/higiene/screens/HigieneHomeScreen";
import type { HigieneStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<HigieneStackParamList>();

export function HigieneNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HigieneHome" component={HigieneHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

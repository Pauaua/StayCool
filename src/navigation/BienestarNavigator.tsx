import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BienestarHomeScreen } from "@/features/bienestar/screens/BienestarHomeScreen";
import type { BienestarStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<BienestarStackParamList>();

export function BienestarNavigator() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BienestarHome" component={BienestarHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

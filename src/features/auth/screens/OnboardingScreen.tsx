import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-surface-dark px-6 justify-between py-12">
      <View className="mt-16">
        <Text className="text-4xl font-bold text-white mb-3">Agenda Cool ✨</Text>
        <Text className="text-lg text-gray-300">
          Tu bienestar, imagen, vida social y gastos, en un solo lugar. Rápido, simple y bonito.
        </Text>
      </View>
      <View>
        <Button label="Crear cuenta" onPress={() => navigation.navigate("SignUp")} />
        <View className="h-3" />
        <Button
          label="Ya tengo cuenta"
          variant="ghost"
          onPress={() => navigation.navigate("SignIn")}
        />
      </View>
    </SafeAreaView>
  );
}

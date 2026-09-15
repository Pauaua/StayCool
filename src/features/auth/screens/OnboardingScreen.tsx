import React from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { GradientBackground } from "@/components/ui/GradientBackground";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 px-6 py-12">
        <View className="mt-16">
          <View className="flex-row items-center mb-3">
            <Text className="font-script text-navy" style={{ fontSize: 48 }}>
              Agenda Cool
            </Text>
            <Image
              source={require("../../../../assets/images/brillitos.png")}
              style={{ width: 32, height: 32, marginLeft: 8 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-navy/80" style={{ fontSize: 14 }}>
            Tu bienestar, imagen, vida social y gastos, en un solo lugar. Rápido, simple y bonito.
          </Text>
        </View>

        <View className="flex-1 items-center justify-start">
          <Image
            source={require("../../../../assets/images/imagen_home.png")}
            style={{ width: "100%", height: 420 }}
            resizeMode="contain"
          />
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
    </GradientBackground>
  );
}

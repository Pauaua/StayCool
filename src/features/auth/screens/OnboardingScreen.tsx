import React from "react";
import { Image, SafeAreaView, Text, View, useWindowDimensions } from "react-native";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { sectionColors } from "@/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Reveal } from "@/components/ui/Reveal";
import { Floating } from "@/components/ui/Floating";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";
import { Heading } from "@/components/ui/Heading";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  // Ancho fijo en px (pantalla menos el padding horizontal de 24 a cada lado):
  // un porcentaje dentro de contenedores que se ajustan a su contenido puede
  // colapsar a 0 en Android y la imagen desaparece.
  const { width } = useWindowDimensions();
  const heroWidth = width - 48;
  const { t } = useT();

  return (
    <ScreenBackground color={sectionColors.Onboarding}>
      <SafeAreaView className="flex-1 px-6 py-12">
        <Reveal className="mt-16" offset={-16} duration={500}>
          <View className="flex-row items-center mb-3">
            <Heading style={{ fontSize: 36 }}>
              Agenda Cool
            </Heading>
            <Image
              source={require("../../../../assets/images/brillitos.png")}
              style={{ width: 32, height: 32, marginLeft: 8 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-ink/80" style={{ fontSize: 14 }}>
            {t("auth.onboardingTagline")}
          </Text>
        </Reveal>

        <Reveal className="flex-1 items-center justify-start" delay={150} offset={30} duration={600}>
          <Floating>
            <Image
              source={require("../../../../assets/images/ImagenInicial.png")}
              style={{ width: heroWidth, height: 420 }}
              resizeMode="contain"
            />
          </Floating>
        </Reveal>

        <Reveal delay={350} offset={26}>
          <Button label={t("auth.createAccount")} variant="white" fullWidth onPress={() => navigation.navigate("SignUp")} />
          <View className="h-3" />
          <Button
            label={t("auth.haveAccount")}
            variant="outlineWhite"
            fullWidth
            onPress={() => navigation.navigate("SignIn")}
          />
        </Reveal>
      </SafeAreaView>
    </ScreenBackground>
  );
}

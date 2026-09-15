import React, { useState } from "react";
import { Alert, Image, SafeAreaView, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      Alert.alert(
        "Revisá tu correo",
        "Te mandamos un link para elegir una contraseña nueva.",
        [{ text: "OK", onPress: () => navigation.navigate("SignIn") }]
      );
    } catch (error) {
      Alert.alert("No se pudo enviar el correo", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 px-6 justify-center">
        <View className="items-center mb-4">
          <Image
            source={require("../../../../assets/images/Logo.jpg")}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
        </View>
        <View className="flex-row items-center mb-3">
          <Image
            source={require("../../../../assets/images/candado.png")}
            style={{ width: 32, height: 32, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text className="font-script text-navy" style={{ fontSize: 36 }}>
            Recuperar contraseña
          </Text>
        </View>
        <Text className="text-navy/70 mb-6">
          Ingresa tu correo electrónico y, si está asociada a alguna cuenta creada en StayCool, te
          llegará un correo para restaurar tu contraseña. ¡Atenta!
        </Text>
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Button label="Enviar link" onPress={handleSend} loading={loading} />
      </SafeAreaView>
    </GradientBackground>
  );
}

import React, { useState } from "react";
import { Alert, SafeAreaView, Text } from "react-native";
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
        <Text className="font-script text-navy mb-3" style={{ fontSize: 36 }}>
          Recuperar contraseña 🔑
        </Text>
        <Text className="text-navy/70 mb-6">
          Ingresá tu email y te mandamos un link para elegir una contraseña nueva.
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

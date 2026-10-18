import React, { useState } from "react";
import { Alert, SafeAreaView, Text } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { sectionColors } from "@/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Heading } from "@/components/ui/Heading";

// Se muestra en vez de la app normal mientras `isPasswordRecovery` es true
// (ver RootNavigator) — el usuario llegó acá desde el link de recuperación
// del mail y tiene que elegir una contraseña nueva antes de seguir.
export function ResetPasswordScreen() {
  const { completePasswordReset } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (password.length < 6) {
      Alert.alert("Contraseña muy corta", "Usá al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await completePasswordReset(password);
    } catch (error) {
      Alert.alert("No se pudo actualizar la contraseña", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenBackground color={sectionColors.Auth}>
      <SafeAreaView className="flex-1 px-6 justify-center">
        <Heading className="mb-3" style={{ fontSize: 28 }}>
          Elegí una contraseña nueva
        </Heading>
        <TextField label="Contraseña nueva" secureTextEntry value={password} onChangeText={setPassword} />
        <TextField
          label="Repetila"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Button label="Guardar" onPress={handleSave} loading={loading} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

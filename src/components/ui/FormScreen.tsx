import React from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from "react-native";

// Envoltorio estándar para pantallas de formulario: evita que el teclado
// tape el botón de "Guardar" cuando el formulario es largo (KeyboardAvoidingView
// + padding inferior en el ScrollView).
export function FormScreen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

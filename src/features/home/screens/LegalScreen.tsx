import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { MarkdownLite } from "@/components/ui/MarkdownLite";
import { LEGAL_CONTENT } from "@/features/home/data/legalContent";

// Política de Privacidad + Términos de Uso, en una sola pantalla scrolleable
// (contenido provisto por el responsable de la app, ver legalContent.ts).
export function LegalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark">
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <MarkdownLite content={LEGAL_CONTENT} />
      </ScrollView>
    </SafeAreaView>
  );
}

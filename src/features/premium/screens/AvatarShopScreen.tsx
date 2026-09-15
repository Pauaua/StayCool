import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { AVATAR_CATALOG, isStarterPiece } from "@/features/premium/avatar/catalog";
import type { AvatarCategory } from "@/features/premium/avatar/types";
import { renderAvatarUrl } from "@/features/premium/avatar/renderAvatar";
import {
  useAvatarSelection,
  useEquipStarterPiece,
  // Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
  // usePurchaseAvatarPiece,
  useUnlockedPieces,
} from "@/features/premium/hooks/useAvatar";
// import { useMooneyBalance } from "@/features/premium/hooks/useMooney";

const CATEGORY_LABELS: Record<AvatarCategory, string> = {
  cara: "Cara",
  pelo: "Pelo",
  color_piel: "Tono de piel",
  accesorio: "Accesorio",
};

export function AvatarShopScreen() {
  const { data: selection } = useAvatarSelection();
  const { data: unlocked } = useUnlockedPieces();
  // const { data: balance } = useMooneyBalance();
  const equipStarter = useEquipStarterPiece();
  // const purchase = usePurchaseAvatarPiece();
  const [pendingPieceKey, setPendingPieceKey] = useState<string | null>(null);

  if (!selection || !unlocked) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-surface-dark">
        <ActivityIndicator color="#b825f2" size="large" />
      </SafeAreaView>
    );
  }

  const isPending = (category: AvatarCategory, pieceId: string) =>
    pendingPieceKey === `${category}:${pieceId}`;

  async function handlePress(category: AvatarCategory, pieceId: string, cost: number) {
    const isEquipped = selection?.[category] === pieceId;
    if (isEquipped) return;

    const key = `${category}:${pieceId}`;
    setPendingPieceKey(key);
    try {
      if (isStarterPiece(category, pieceId) || unlocked?.has(key)) {
        await equipStarter.mutateAsync({ category, pieceId });
        return;
      }
      // Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
      // if ((balance ?? 0) < cost) {
      //   Alert.alert("MOOney insuficiente", `Necesitás ${cost} MOOney para esta pieza. Tenés ${balance}.`);
      //   return;
      // }
      // await purchase.mutateAsync({ category, pieceId, cost });
      return;
    } catch (error) {
      Alert.alert("No se pudo aplicar", error instanceof Error ? error.message : "Intenta de nuevo.");
    } finally {
      setPendingPieceKey(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark">
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center mb-4">
          <Image
            source={{ uri: renderAvatarUrl(selection, 320) }}
            style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#e485ff" }}
          />
          {/* Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
          <Text className="mt-3 text-sm font-semibold text-brand-500">🪙 {balance} MOOney</Text>
          */}
        </View>

        {(Object.keys(AVATAR_CATALOG) as AvatarCategory[]).map((category) => (
          <Card key={category} className="mb-4">
            <Text className="text-base font-bold text-surface-dark dark:text-white mb-3">
              {CATEGORY_LABELS[category]}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {AVATAR_CATALOG[category].map((piece) => {
                const equipped = selection[category] === piece.id;
                const owned = piece.cost === 0 || unlocked.has(`${category}:${piece.id}`);
                return (
                  <Pressable
                    key={piece.id}
                    onPress={() => handlePress(category, piece.id, piece.cost)}
                    disabled={isPending(category, piece.id)}
                    className={`rounded-card px-3 py-2.5 border ${
                      equipped
                        ? "bg-brand-500 border-brand-500"
                        : "bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {isPending(category, piece.id) ? (
                      <ActivityIndicator size="small" color={equipped ? "#fff" : "#b825f2"} />
                    ) : (
                      <>
                        <Text className={equipped ? "text-white font-semibold" : "text-surface-dark dark:text-white"}>
                          {piece.label}
                        </Text>
                        <Text className={`text-xs mt-0.5 ${equipped ? "text-white/80" : "text-gray-400"}`}>
                          {owned ? (equipped ? "Equipado" : "Desbloqueado") : `🪙 ${piece.cost}`}
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

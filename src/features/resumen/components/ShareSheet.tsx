import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { SHARE_TARGETS, type ShareNetwork } from "@/features/resumen/services/shareService";

const NETWORK_STYLE: Record<ShareNetwork, { emoji: string; bg: string }> = {
  "instagram-stories": { emoji: "📸", bg: "#e485ff" },
  whatsapp: { emoji: "💬", bg: "#25D366" },
  twitter: { emoji: "𝕏", bg: "#000000" },
  facebook: { emoji: "👍", bg: "#1877f2" },
  tiktok: { emoji: "🎵", bg: "#000000" },
};

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (network: ShareNetwork) => void;
  onMoreOptions: () => void;
  pendingNetwork: ShareNetwork | null;
}

// Selector propio de redes (no el share sheet genérico del sistema como
// primera opción) — cada botón dispara shareToNetwork con el método
// específico de esa red; "Más opciones" abre el selector nativo para
// cualquier otra app.
export function ShareSheet({ visible, onClose, onSelect, onMoreOptions, pendingNetwork }: ShareSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-white dark:bg-surface-cardDark rounded-t-3xl p-6" onPress={(e) => e.stopPropagation()}>
          <Text className="text-lg font-bold text-surface-dark dark:text-white mb-4">Compartir Mi Resumen</Text>

          <View className="flex-row flex-wrap gap-3 justify-between">
            {SHARE_TARGETS.map((target) => {
              const style = NETWORK_STYLE[target.id];
              const isPending = pendingNetwork === target.id;
              return (
                <Pressable
                  key={target.id}
                  onPress={() => onSelect(target.id)}
                  disabled={!!pendingNetwork}
                  className="items-center"
                  style={{ width: "18%" }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: style.bg,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pendingNetwork && !isPending ? 0.4 : 1,
                    }}
                  >
                    {isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 20 }}>{style.emoji}</Text>}
                  </View>
                  <Text className="text-[10px] mt-1.5 text-center text-gray-500 dark:text-gray-300">
                    {target.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onMoreOptions} className="mt-6 items-center py-3 border-t border-gray-100 dark:border-gray-700">
            <Text className="text-brand-500 font-semibold">Más opciones</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

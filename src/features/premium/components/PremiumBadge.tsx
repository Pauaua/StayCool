import React from "react";
import { Text, View } from "react-native";
import { usePremium } from "@/features/premium/hooks/usePremium";

// Ícono de estrella junto al nickname, exclusivo del plan Full. Se usa
// envolviendo el nombre: <NicknameWithBadge>{name}</NicknameWithBadge>
export function PremiumStar({ size = 14 }: { size?: number }) {
  return (
    <Text style={{ fontSize: size, color: "#ffb454" }} accessibilityLabel="Plan Full">
      {" "}
      ⭐
    </Text>
  );
}

export function NicknameWithBadge({
  name,
  textClassName = "text-base font-semibold text-surface-dark dark:text-white",
}: {
  name: string;
  textClassName?: string;
}) {
  const { isFull } = usePremium();
  return (
    <View className="flex-row items-center">
      <Text className={textClassName}>{name}</Text>
      {isFull ? <PremiumStar /> : null}
    </View>
  );
}

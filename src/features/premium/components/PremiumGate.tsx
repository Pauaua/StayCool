import React from "react";
import { Image, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePremium } from "@/features/premium/hooks/usePremium";

interface PremiumGateProps {
  minTier: "basico" | "full";
  children: React.ReactNode;
}

const TIER_RANK = { free: 0, basico: 1, full: 2 } as const;

// Bloquea children si el tier del usuario no alcanza minTier, mostrando un
// CTA que lleva al paywall (HomeStack > Paywall).
export function PremiumGate({ minTier, children }: PremiumGateProps) {
  const { tier, isLoading } = usePremium();
  const navigation = useNavigation<any>();

  if (isLoading) return null;
  if (TIER_RANK[tier] >= TIER_RANK[minTier]) return <>{children}</>;

  return (
    <Card className="items-center py-8 px-6">
      <Image
        source={require("../../../../assets/images/uñotas.png")}
        style={{ width: 40, height: 40 }}
        resizeMode="contain"
      />
      <Text className="text-lg font-bold text-surface-dark dark:text-white mt-3 text-center">
        Hazte diva para acceder a esta sección
      </Text>
      <View className="mt-4 w-full">
        <Button label="Ver planes" onPress={() => navigation.navigate("Paywall")} />
      </View>
    </Card>
  );
}

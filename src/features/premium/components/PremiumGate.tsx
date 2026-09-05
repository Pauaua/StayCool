import React from "react";
import { Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { usePremium } from "@/features/premium/hooks/usePremium";

interface PremiumGateProps {
  minTier: "basico" | "full";
  children: React.ReactNode;
}

const TIER_RANK = { free: 0, basico: 1, full: 2 } as const;

// Bloquea children si el tier del usuario no alcanza minTier, mostrando un
// CTA en su lugar. No incluye el flujo de compra (paywall/getOfferings) —
// eso es una pantalla aparte que todavía no está en el alcance de esta
// tanda de frentes; hoy este componente es el punto de bloqueo, listo para
// enganchar la navegación al paywall en cuanto exista.
export function PremiumGate({ minTier, children }: PremiumGateProps) {
  const { tier, isLoading } = usePremium();

  if (isLoading) return null;
  if (TIER_RANK[tier] >= TIER_RANK[minTier]) return <>{children}</>;

  const planLabel = minTier === "full" ? "Agenda Cool+ Full" : "Agenda Cool+ Básico";

  return (
    <Card className="items-center py-8 px-6">
      <Text style={{ fontSize: 32 }}>🔒</Text>
      <Text className="text-lg font-bold text-surface-dark dark:text-white mt-3 text-center">
        Esto es parte de {planLabel}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
        Suscribite para desbloquear esta función.
      </Text>
    </Card>
  );
}

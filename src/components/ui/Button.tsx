import React, { useState } from "react";
import { GestureResponderEvent, Image, ImageSourcePropType, Text, View, ActivityIndicator } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";
import { TapSparkles } from "@/components/ui/TapSparkles";
import { colors } from "@/theme";

interface ButtonProps {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  // Píldoras del manual de marca, siempre con texto oscuro:
  // - primary: relleno morado, la acción principal.
  // - filled: relleno blanco.
  // - outline: fondo transparente con borde (oscuro, porque los fondos de la
  //   app son claros y un borde blanco no se vería).
  // Sobre fondos de color sólido (pantallas de inicio y bienvenida), tal cual
  // el manual:
  // - white: relleno blanco sin borde, texto oscuro.
  // - outlineWhite: borde blanco, fondo transparente, texto blanco.
  variant?: "primary" | "filled" | "outline" | "white" | "outlineWhite";
  size?: "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  // Tipografía del label: "semibold" (Rethink Sans, default) o "display"
  // (Protest Strike en mayúsculas, para botones destacados).
  font?: "semibold" | "display";
  // Ícono opcional a la izquierda del label, dentro del botón.
  icon?: ImageSourcePropType;
  fullWidth?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-morado border border-ink active:opacity-80",
  filled: "bg-white border border-ink active:opacity-80",
  outline: "bg-transparent border border-ink active:bg-white/40",
  white: "bg-white border border-white active:opacity-80",
  outlineWhite: "bg-transparent border-2 border-white active:bg-white/20",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  font = "semibold",
  icon,
  fullWidth,
}: ButtonProps) {
  // Cada toque dispara una mini explosión de brillitos desde el botón.
  const [sparkleTrigger, setSparkleTrigger] = useState(0);

  return (
    <PressableScale
      wrapperClassName={fullWidth ? "w-full" : undefined}
      onPress={(e) => {
        setSparkleTrigger((n) => n + 1);
        onPress(e);
      }}
      disabled={disabled || loading}
      className={`rounded-full items-center justify-center ${fullWidth ? "w-full" : ""} ${
        size === "sm" ? "px-4 py-2.5" : "px-6 py-3.5"
      } ${variantStyles[variant]} ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outlineWhite" ? colors.white : colors.ink} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? (
            <Image source={icon} style={{ width: 28, height: 28, marginRight: 8 }} resizeMode="contain" />
          ) : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            className={`${font === "display" ? "font-display" : "font-semibold"} text-center ${variant === "outlineWhite" ? "text-white" : "text-ink"} ${
              font === "display" ? (size === "sm" ? "text-lg" : "text-2xl") : size === "sm" ? "text-sm" : "text-base"
            }`}
            style={font === "display" ? { textTransform: "uppercase" } : undefined}
          >
            {label}
          </Text>
        </View>
      )}
      <TapSparkles trigger={sparkleTrigger} />
    </PressableScale>
  );
}

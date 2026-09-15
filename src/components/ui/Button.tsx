import React from "react";
import { Image, ImageSourcePropType, Pressable, Text, View, ActivityIndicator } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  // Tipografía del label: "semibold" (Rethink Sans, default) o "script"
  // (Parisienne, para pantallas de auth/bienvenida).
  font?: "semibold" | "script";
  // Ícono opcional a la izquierda del label, dentro del botón.
  icon?: ImageSourcePropType;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-500 border border-brand-500 active:bg-brand-600",
  secondary: "bg-white/60 dark:bg-white/10 border border-brand-500 active:bg-white/80",
  ghost: "bg-transparent border border-brand-500",
};

const variantTextStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "text-white",
  secondary: "text-brand-500",
  ghost: "text-brand-500",
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
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-full items-center justify-center ${
        font === "script" ? "w-full" : ""
      } ${size === "sm" ? "px-4 py-2.5" : "px-6 py-3.5"} ${variantStyles[variant]} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? (
            <Image
              source={icon}
              style={{
                width: 28,
                height: 28,
                marginRight: 8,
                tintColor: variant === "primary" ? "#fff" : undefined,
              }}
              resizeMode="contain"
            />
          ) : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            className={`${font === "script" ? "font-script" : "font-semibold"} text-center ${
              font === "script"
                ? size === "sm"
                  ? "text-3xl"
                  : "text-5xl"
                : size === "sm"
                  ? "text-sm"
                  : "text-base"
            } ${variantTextStyles[variant]}`}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

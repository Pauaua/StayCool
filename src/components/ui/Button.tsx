import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
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
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-full items-center justify-center ${
        size === "sm" ? "px-4 py-2.5" : "px-5 py-3.5"
      } ${variantStyles[variant]} ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          className={`font-semibold ${size === "sm" ? "text-sm" : "text-base"} ${variantTextStyles[variant]}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

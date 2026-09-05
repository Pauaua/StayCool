import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-500 active:bg-brand-600",
  secondary: "bg-accent-teal active:bg-teal-600",
  ghost: "bg-transparent border border-brand-500",
};

const variantTextStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "text-white",
  secondary: "text-surface-dark",
  ghost: "text-brand-500",
};

export function Button({ label, onPress, variant = "primary", loading, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-card px-5 py-3.5 items-center justify-center ${variantStyles[variant]} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`font-semibold text-base ${variantTextStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}

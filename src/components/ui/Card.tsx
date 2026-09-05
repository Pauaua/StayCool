import React from "react";
import { View, ViewProps } from "react-native";

export function Card({ children, className = "", ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface-cardLight dark:bg-surface-cardDark rounded-card p-4 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

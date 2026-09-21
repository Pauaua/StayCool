import React from "react";
import { ViewProps } from "react-native";
import { Reveal } from "@/components/ui/Reveal";

interface CardProps extends ViewProps {
  className?: string;
  // Retraso de la animación de entrada, para escalonar tarjetas seguidas.
  delay?: number;
  // false para tarjetas que no deben animarse al montarse.
  animated?: boolean;
}

export function Card({ children, className = "", delay, animated, ...rest }: CardProps) {
  return (
    <Reveal
      className={`bg-surface-cardLight dark:bg-surface-cardDark rounded-card p-4 shadow-sm ${className}`}
      delay={delay}
      animated={animated}
      {...rest}
    >
      {children}
    </Reveal>
  );
}

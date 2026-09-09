import React, { createContext, useContext } from "react";

// Permite volver al panel inicial (Abrir Agenda / Ver Resumen / Hazte más
// cool) desde cualquier pantalla dentro de MainShell, sin tener que pasar la
// función a mano por cada navigator independiente.
const WelcomeNavigationContext = createContext<(() => void) | undefined>(undefined);

export function WelcomeNavigationProvider({
  onBackToWelcome,
  children,
}: {
  onBackToWelcome: () => void;
  children: React.ReactNode;
}) {
  return (
    <WelcomeNavigationContext.Provider value={onBackToWelcome}>
      {children}
    </WelcomeNavigationContext.Provider>
  );
}

export function useGoToWelcome(): () => void {
  const ctx = useContext(WelcomeNavigationContext);
  if (!ctx) throw new Error("useGoToWelcome debe usarse dentro de <WelcomeNavigationProvider>");
  return ctx;
}

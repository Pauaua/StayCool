import React, { createContext, useContext, useState } from "react";

// Permite que una pantalla (ej. Mi Resumen) pida ocultar el rail lateral de
// módulos mientras está activa, para verse a pantalla completa.
const RailVisibilityContext = createContext<{
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
} | undefined>(undefined);

export function RailVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <RailVisibilityContext.Provider value={{ hidden, setHidden }}>
      {children}
    </RailVisibilityContext.Provider>
  );
}

export function useRailVisibility() {
  const ctx = useContext(RailVisibilityContext);
  if (!ctx) throw new Error("useRailVisibility debe usarse dentro de <RailVisibilityProvider>");
  return ctx;
}

// Oculta el rail mientras el componente que la llama está montado, y lo
// vuelve a mostrar al desmontarse.
export function useHideRailWhileMounted() {
  const { setHidden } = useRailVisibility();
  React.useEffect(() => {
    setHidden(true);
    return () => setHidden(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

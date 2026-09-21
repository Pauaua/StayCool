import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { SparkleBurst } from "@/components/ui/SparkleBurst";

type Trigger = (x: number, y: number) => void;

const SparkleTransitionContext = createContext<Trigger>(() => {});

// Capa global de la explosión de brillitos. Vive por encima de todo el árbol
// de navegación, así los brillitos siguen volando aunque la pantalla de abajo
// cambie a mitad de la animación (transición hecha de brillos, sin pantalla
// blanca en el medio).
export function SparkleTransitionProvider({ children }: { children: React.ReactNode }) {
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const nextId = useRef(0);

  const trigger = useCallback<Trigger>((x, y) => {
    nextId.current += 1;
    setBurst({ id: nextId.current, x, y });
  }, []);

  return (
    <SparkleTransitionContext.Provider value={trigger}>
      {children}
      {burst ? (
        <SparkleBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          onFinish={() => setBurst((current) => (current && current.id === burst.id ? null : current))}
        />
      ) : null}
    </SparkleTransitionContext.Provider>
  );
}

// Dispara la explosión desde un punto de la pantalla (ej. donde se tocó).
export function useSparkleTransition(): Trigger {
  return useContext(SparkleTransitionContext);
}

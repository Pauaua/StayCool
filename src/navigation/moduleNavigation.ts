import { useEffect, useRef } from "react";
import { createNavigationContainerRef, type NavigationContainerRefWithCurrent } from "@react-navigation/native";

// Cada módulo de MainShell tiene su propio NavigationContainer independiente,
// así que desde afuera (el menú Agenda, Home) no hay un navigation común para
// ir a una pantalla interna (ej. Imagen → Vestuario). Los navigators que lo
// necesitan registran su ref acá y MainShell navega a través de ella.
type AnyNavigationRef = NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;

const refs = new Map<string, AnyNavigationRef>();

export function useModuleNavigationRef(moduleKey: string) {
  const ref = useRef(createNavigationContainerRef()).current;
  useEffect(() => {
    refs.set(moduleKey, ref);
    return () => {
      refs.delete(moduleKey);
    };
  }, [moduleKey, ref]);
  return ref;
}

export function navigateInModule(moduleKey: string, route: string) {
  const ref = refs.get(moduleKey);
  if (ref?.isReady()) {
    // Las rutas se validan en cada navigator; acá llegan como string.
    (ref.navigate as (name: string) => void)(route);
  }
}

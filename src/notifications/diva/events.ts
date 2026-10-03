// Eventos chicos a nivel de módulo, para conectar partes de la app que no
// comparten un Provider.

type Listener<T> = (value: T) => void;

function createChannel<T>() {
  const listeners = new Set<Listener<T>>();
  return {
    emit(value: T) {
      listeners.forEach((listener) => listener(value));
    },
    subscribe(listener: Listener<T>) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

// Algo cambió en los datos que usan los Recordatorios Diva (se registró o
// desmarcó un hábito, se agregó/quitó un ítem): hay que reprogramar.
const dataChanged = createChannel<void>();
export const notifyDivaDataChanged = () => dataChanged.emit();
export const onDivaDataChanged = dataChanged.subscribe;

// Se tocó una notificación que pide abrir un módulo (ej. "Higiene"). Queda
// guardado como pendiente por si MainShell todavía no está montado (app
// recién abierta desde la notificación, en el saludo inicial).
let pendingModule: string | null = null;
const openModule = createChannel<string>();

export function requestOpenModule(module: string) {
  pendingModule = module;
  openModule.emit(module);
}

export function consumePendingModule(): string | null {
  const module = pendingModule;
  pendingModule = null;
  return module;
}

export const onOpenModuleRequest = openModule.subscribe;

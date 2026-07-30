import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePluginStore } from "@/stores/plugins";
import type { PluginSlot, PluginInstance } from "@/types";

interface PluginRegistryContextValue {
  getPlugins: (slot: PluginSlot) => PluginInstance[];
}

const PluginRegistryContext = createContext<PluginRegistryContextValue | null>(null);

export function usePluginRegistry() {
  const ctx = useContext(PluginRegistryContext);
  if (!ctx) {
    throw new Error("usePluginRegistry must be used within PluginRegistry");
  }
  return ctx;
}

interface PluginSlotContentProps {
  slot: PluginSlot;
}

export function PluginSlot({ slot }: PluginSlotContentProps) {
  const plugins = usePluginRegistry().getPlugins(slot);

  if (plugins.length === 0) return null;

  return (
    <>
      {plugins.map((p) => {
        const Component = p.component;
        return <Component key={p.manifest.id} />;
      })}
    </>
  );
}

interface PluginRegistryProps {
  children: ReactNode;
  initialPlugins?: PluginInstance[];
}

export function PluginRegistry({ children, initialPlugins }: PluginRegistryProps) {
  const register = usePluginStore((s) => s.register);

  useEffect(() => {
    if (!initialPlugins?.length) return;
    for (const plugin of initialPlugins) {
      register(plugin);
    }
  }, []);

  const ctx: PluginRegistryContextValue = {
    getPlugins: (slot: PluginSlot) => usePluginStore.getState().getBySlot(slot),
  };

  return (
    <PluginRegistryContext.Provider value={ctx}>
      {children}
    </PluginRegistryContext.Provider>
  );
}

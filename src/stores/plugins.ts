import { create } from "zustand";
import type { PluginInstance, PluginSlot, PluginCommand, PluginShortcut } from "@/types";

export interface PluginState {
  plugins: Map<string, PluginInstance>;
  commands: Map<string, PluginCommand>;
  shortcuts: Map<string, PluginShortcut>;
  register: (instance: PluginInstance) => void;
  unregister: (id: string) => void;
  getBySlot: (slot: PluginSlot) => PluginInstance[];
  setEnabled: (id: string, enabled: boolean) => void;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: new Map(),
  commands: new Map(),
  shortcuts: new Map(),

  register: (instance: PluginInstance) => {
    set((s) => {
      const plugins = new Map(s.plugins);
      plugins.set(instance.manifest.id, instance);

      const commands = new Map(s.commands);
      const shortcuts = new Map(s.shortcuts);

      if (instance.manifest.commands) {
        for (const cmd of instance.manifest.commands) {
          commands.set(`plugin:${instance.manifest.id}:${cmd.id}`, cmd);
        }
      }
      if (instance.manifest.shortcuts) {
        for (const sc of instance.manifest.shortcuts) {
          shortcuts.set(sc.actionId, sc);
        }
      }

      return { plugins, commands, shortcuts };
    });
  },

  unregister: (id: string) => {
    set((s) => {
      const plugins = new Map(s.plugins);
      const instance = plugins.get(id);
      plugins.delete(id);

      const commands = new Map(s.commands);
      const shortcuts = new Map(s.shortcuts);

      if (instance?.manifest.commands) {
        for (const cmd of instance.manifest.commands) {
          commands.delete(`plugin:${id}:${cmd.id}`);
        }
      }
      if (instance?.manifest.shortcuts) {
        for (const sc of instance.manifest.shortcuts) {
          shortcuts.delete(sc.actionId);
        }
      }

      return { plugins, commands, shortcuts };
    });
  },

  getBySlot: (slot: PluginSlot) => {
    const { plugins } = get();
    return Array.from(plugins.values()).filter(
      (p) => p.manifest.slot === slot && p.manifest.enabled,
    );
  },

  setEnabled: (id: string, enabled: boolean) => {
    set((s) => {
      const plugins = new Map(s.plugins);
      const instance = plugins.get(id);
      if (instance) {
        plugins.set(id, {
          ...instance,
          manifest: { ...instance.manifest, enabled },
        });
      }
      return { plugins };
    });
  },
}));

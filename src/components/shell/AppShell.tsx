import { useState } from "react";
import { Titlebar } from "./Titlebar";
import { StatusBar } from "./StatusBar";
import { SplitPane } from "./SplitPane";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { CommandPalette } from "@/components/common/CommandPalette";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAppStore } from "@/stores/app";
import { PluginRegistry } from "@/plugins/PluginRegistry";
import { quickActionsPlugin } from "@/plugins/__registry__/QuickActions";
import { pluginManagerPlugin } from "@/plugins/__registry__/PluginManager";

export function AppShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  useTheme();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setTheme = useAppStore((s) => s.setTheme);
  const theme = useAppStore((s) => s.theme);

  useKeyboardShortcuts({
    "toggle-sidebar": toggleSidebar,
    "toggle-theme": () => {
      const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
      setTheme(next);
    },
    "command-palette": () => setCommandPaletteOpen(true),
  });

  return (
    <PluginRegistry initialPlugins={[quickActionsPlugin, pluginManagerPlugin]}>
      <div className="flex h-full flex-col bg-surface text-text-primary">
        {commandPaletteOpen && <CommandPalette onClose={() => setCommandPaletteOpen(false)} />}
        <Titlebar />

        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && (
            <SplitPane
              left={<Sidebar />}
              right={<ChatView />}
              initialSize={280}
            />
          )}
          {!sidebarOpen && (
            <div className="flex-1 overflow-hidden">
              <ChatView />
            </div>
          )}
        </div>

        <StatusBar />
      </div>
    </PluginRegistry>
  );
}

import { useEffect } from "react";

export type ShortcutAction =
  | { action: "toggle-sidebar" }
  | { action: "toggle-theme" }
  | { action: "new-chat" }
  | { action: "search" }
  | { action: "command-palette" }
  | { action: "close-window" };

export type ShortcutMap = Record<string, ShortcutAction>;

const DEFAULT_SHORTCUTS: ShortcutMap = {
  "meta+b": { action: "toggle-sidebar" },
  "meta+t": { action: "toggle-theme" },
  "meta+n": { action: "new-chat" },
  "meta+p": { action: "command-palette" },
  "meta+w": { action: "close-window" },
};

export function useKeyboardShortcuts(
  handlers: Partial<Record<ShortcutAction["action"], () => void>>,
  customShortcuts?: ShortcutMap,
) {
  const shortcuts = customShortcuts ?? DEFAULT_SHORTCUTS;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const parts: string[] = [];
      if (e.metaKey) parts.push("meta");
      if (e.ctrlKey) parts.push("ctrl");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");
      parts.push(e.key.toLowerCase());

      const key = parts.join("+");
      const mapped = shortcuts[key];
      if (!mapped) return;

      const handler = handlers[mapped.action];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts, handlers]);
}

export { DEFAULT_SHORTCUTS };

import { useState, useRef, useEffect, useCallback } from "react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAppStore } from "@/stores/app";
import { usePluginStore } from "@/stores/plugins";

interface CommandItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTab = useWorkspaceStore((s) => s.addTab);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const pluginCommands = usePluginStore((s) => Array.from(s.commands.values()));

  const builtinCommands: CommandItem[] = [
    { id: "new-chat", label: "New Chat", icon: "chat", action: () => addTab("chat", "New Chat") },
    { id: "flashcards", label: "Open Flashcards", icon: "card", action: () => addTab("flashcards", "Flashcards") },
    { id: "quiz", label: "Start Quiz", icon: "quiz", action: () => addTab("quiz", "Quiz") },
    { id: "bookmarks", label: "Open Bookmarks", icon: "bookmark", action: () => addTab("bookmarks", "Bookmarks") },
    { id: "search", label: "Search", icon: "search", action: () => addTab("search", "Search") },
    { id: "settings", label: "Open Settings", icon: "settings", action: () => addTab("settings", "Settings") },
    { id: "toggle-sidebar", label: "Toggle Sidebar", icon: "sidebar", action: toggleSidebar },
    { id: "toggle-theme", label: "Toggle Theme", icon: "theme", action: () => {
      const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
      setTheme(next);
    }},
  ];

  const commands = [...builtinCommands, ...pluginCommands];

  const filtered = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const execute = useCallback((item: CommandItem) => {
    item.action();
    onClose();
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }

      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        execute(filtered[selectedIndex]);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, filtered, selectedIndex, execute]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-text-muted">
              No matching commands
            </div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => execute(item)}
              onMouseEnter={() => setSelectedIndex(i)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
              style={{
                background: i === selectedIndex ? "var(--color-surface-hover)" : "transparent",
                color: "var(--color-text-primary)",
              }}
            >
              <CommandIcon id={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommandIcon({ id }: { id?: string }) {
  const p = { width: 14, height: 14, fill: "none", stroke: "var(--color-text-secondary)", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (id) {
    case "chat":
      return (<svg {...p} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
    case "card":
      return (<svg {...p} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>);
    case "quiz":
      return (<svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
    case "bookmark":
      return (<svg {...p} viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
    case "search":
      return (<svg {...p} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
    case "settings":
      return (<svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>);
    case "sidebar":
      return (<svg {...p} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>);
    case "theme":
      return (<svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>);
    default:
      return null;
  }
}

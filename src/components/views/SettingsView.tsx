import { useAppStore } from "@/stores/app";
import { PluginSlot } from "@/plugins/PluginRegistry";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘B", label: "Toggle Sidebar" },
  { keys: "⌘T", label: "Cycle Theme" },
  { keys: "⌘N", label: "New Chat" },
  { keys: "⌘P", label: "Command Palette" },
  { keys: "⌘W", label: "Close Tab" },
];

export function SettingsView() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 gap-8">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Settings</h2>
      </div>

      <section>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Appearance</h3>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="flex-1 rounded-lg px-4 py-2.5 text-xs font-medium capitalize transition-colors"
              style={{
                background: theme === t ? "var(--color-accent)" : "var(--color-surface-alt)",
                color: theme === t ? "#fff" : "var(--color-text-primary)",
                border: theme === t ? "none" : "1px solid var(--color-border)",
              }}
            >
              {t === "light" ? "☀️ " : t === "dark" ? "🌙 " : "💻 "}
              {t}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Keyboard Shortcuts</h3>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.keys}
              className="flex items-center justify-between px-4 py-2.5 text-xs"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <span className="text-text-primary">{sc.label}</span>
              <kbd className="rounded-md px-2 py-0.5 font-mono text-[11px] text-text-secondary"
                style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}
              >
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">About</h3>
        <div className="rounded-xl p-4 text-xs space-y-2" style={{ border: "1px solid var(--color-border)" }}>
          <p className="text-text-primary font-medium">ChatGPT Desktop</p>
          <p className="text-text-secondary">Version 1.0.0</p>
          <p className="text-text-muted">
            A native macOS wrapper for ChatGPT with offline learning tools.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Plugins</h3>
        <PluginSlot slot="settings" />
      </section>
    </div>
  );
}

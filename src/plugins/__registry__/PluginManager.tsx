import { usePluginStore } from "@/stores/plugins";
import type { PluginInstance } from "@/types";

function PluginManagerPanel() {
  const plugins = usePluginStore((s) => s.plugins);
  const setEnabled = usePluginStore((s) => s.setEnabled);

  const allPlugins = Array.from(plugins.values());

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 gap-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Plugins</h2>
        <p className="text-xs text-text-muted mt-1">
          Manage installed plugins
        </p>
      </div>

      <section>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          Installed ({allPlugins.length})
        </h3>
        {allPlugins.length === 0 && (
          <p className="text-xs text-text-muted py-4 text-center">No plugins installed</p>
        )}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          {allPlugins.map((p) => (
            <div
              key={p.manifest.id}
              className="flex items-center justify-between px-4 py-3 text-xs"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary">{p.manifest.name}</p>
                <p className="text-text-muted mt-0.5 truncate">{p.manifest.description}</p>
                <p className="text-text-muted mt-0.5">v{p.manifest.version} &middot; {p.manifest.slot}</p>
              </div>
              <label className="relative inline-flex h-5 w-9 cursor-pointer items-center flex-shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={p.manifest.enabled}
                  onChange={() => setEnabled(p.manifest.id, !p.manifest.enabled)}
                  className="peer sr-only"
                />
                <span
                  className="absolute inset-0 rounded-full transition-colors"
                  style={{
                    background: p.manifest.enabled ? "var(--color-accent)" : "var(--color-border)",
                  }}
                />
                <span
                  className="absolute left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                  style={{
                    transform: p.manifest.enabled ? "translateX(16px)" : "translateX(0)",
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const pluginManagerPlugin: PluginInstance = {
  manifest: {
    id: "plugin-manager",
    name: "Plugin Manager",
    version: "1.0.0",
    description: "View and manage installed plugins",
    slot: "settings",
    enabled: true,
  },
  component: PluginManagerPanel,
};

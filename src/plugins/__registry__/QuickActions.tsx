import type { PluginInstance } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace";

function QuickActionsPanel() {
  const addTab = useWorkspaceStore((s) => s.addTab);

  return (
    <div className="px-2 pb-2">
      <p className="px-1 pb-1 text-[10px] font-medium text-text-muted uppercase tracking-wider">
        Quick Actions
      </p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => addTab("search", "Search")}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
        <button
          onClick={() => addTab("bookmarks", "Bookmarks")}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Bookmarks
        </button>
      </div>
    </div>
  );
}

export const quickActionsPlugin: PluginInstance = {
  manifest: {
    id: "quick-actions",
    name: "Quick Actions",
    version: "1.0.0",
    description: "Quick access to common actions",
    slot: "sidebar:bottom",
    enabled: true,
    commands: [
      {
        id: "open-search",
        label: "Open Search",
        action: () => {
          const { addTab } = useWorkspaceStore.getState();
          addTab("search", "Search");
        },
      },
    ],
  },
  component: QuickActionsPanel,
};

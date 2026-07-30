import { useWorkspaceStore } from "@/stores/workspace";
import { FlashcardsView } from "@/components/views/FlashcardsView";
import { QuizView } from "@/components/views/QuizView";
import { SearchView } from "@/components/views/SearchView";
import { BookmarksView } from "@/components/views/BookmarksView";
import { SettingsView } from "@/components/views/SettingsView";
import { PluginSlot } from "@/plugins/PluginRegistry";

const CHATGPT_URL = "https://chat.openai.com";

export function ChatView() {
  const tabs = useWorkspaceStore((s) => s.tabs);
  const activeTabId = useWorkspaceStore((s) => s.activeTabId);
  const addTab = useWorkspaceStore((s) => s.addTab);
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);
  const removeTab = useWorkspaceStore((s) => s.removeTab);

  if (tabs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <p className="text-sm text-text-muted">Open a conversation to get started</p>
          <button
            onClick={() => addTab("chat", "New Chat")}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-1 px-2 overflow-x-auto flex-shrink-0"
        style={{ height: 36, borderBottom: "1px solid var(--color-border)" }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onMouseDown={(e) => {
              if (e.button === 1) removeTab(tab.id);
            }}
            className={`group flex items-center gap-1.5 rounded-t px-3 py-1.5 text-xs cursor-pointer select-none transition-colors ${
              tab.id === activeTabId
                ? "bg-surface text-text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
            style={
              tab.id === activeTabId
                ? { border: "1px solid var(--color-border)", borderBottom: "1px solid transparent", marginBottom: -1 }
                : undefined
            }
          >
            <span className="truncate max-w-[120px]">{tab.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
              className="ml-1 flex h-4 w-4 items-center justify-center rounded text-text-muted opacity-0 group-hover:opacity-100 hover:bg-surface-hover hover:text-text-primary transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <PluginSlot slot="chat:toolbar" />

      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: tab.id === activeTabId ? "block" : "none" }}
          >
            {tab.type === "chat" && (
              <iframe
                src={CHATGPT_URL}
                className="h-full w-full border-0"
                allow="clipboard-read; clipboard-write"
              />
            )}
            {tab.type === "flashcards" && <FlashcardsView />}
            {tab.type === "quiz" && <QuizView />}
            {tab.type === "search" && <SearchView />}
            {tab.type === "bookmarks" && <BookmarksView />}
            {tab.type === "settings" && <SettingsView />}
          </div>
        ))}
      </div>
    </div>
  );
}

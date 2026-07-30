import { useBookmarksStore } from "@/stores/bookmarks";
import { useWorkspaceStore } from "@/stores/workspace";

export function BookmarksView() {
  const bookmarks = useBookmarksStore((s) => s.bookmarks);
  const deleteBookmark = useBookmarksStore((s) => s.deleteBookmark);
  const addTab = useWorkspaceStore((s) => s.addTab);

  if (bookmarks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No bookmarks yet. Bookmark messages from your conversations.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 gap-2 overflow-y-auto">
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          className="rounded-xl p-3 space-y-1.5"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-text-primary">
              {bm.label || "Untitled Bookmark"}
            </p>
            <button
              onClick={() => deleteBookmark(bm.id)}
              className="flex-shrink-0 rounded p-1 text-text-muted hover:text-error transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {bm.note && <p className="text-xs text-text-secondary">{bm.note}</p>}
          <button
            onClick={() => addTab("chat", bm.label || "Bookmark")}
            className="text-[10px] text-accent hover:text-accent-hover transition-colors"
          >
            Open conversation
          </button>
        </div>
      ))}
    </div>
  );
}

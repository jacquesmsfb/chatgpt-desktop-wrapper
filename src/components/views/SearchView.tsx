import { useSearchStore } from "@/stores/search";

export function SearchView() {
  const results = useSearchStore((s) => s.results);
  const query = useSearchStore((s) => s.query);
  const loading = useSearchStore((s) => s.loading);

  if (!query.trim()) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        Use the search bar in the sidebar to find conversations
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        Searching...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No results for "{query}"
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 gap-4 overflow-y-auto">
      <p className="text-xs text-text-muted">
        {results.length} result{results.length === 1 ? "" : "s"} for "{query}"
      </p>
      <div className="space-y-2">
        {results.map((r, i) => (
          <div
            key={`${r.conversationId}-${i}`}
            className="rounded-xl p-3"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
          >
            <p className="text-xs text-text-primary leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

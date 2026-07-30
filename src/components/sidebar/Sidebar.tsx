import { useState, useEffect, useCallback } from "react";
import { useWorkspaceStore, type TabType } from "@/stores/workspace";
import { useConversationsStore } from "@/stores/conversations";
import { useBookmarksStore } from "@/stores/bookmarks";
import { useFlashcardsStore } from "@/stores/flashcards";
import { useSearchStore } from "@/stores/search";
import { PluginSlot } from "@/plugins/PluginRegistry";

interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  tabType: TabType;
}

const SECTIONS: SidebarSection[] = [
  { id: "conversations", label: "Conversations", icon: "chat", tabType: "chat" },
  { id: "flashcards", label: "Flashcards", icon: "card", tabType: "flashcards" },
  { id: "bookmarks", label: "Bookmarks", icon: "bookmark", tabType: "bookmarks" },
  { id: "quiz", label: "Quiz", icon: "quiz", tabType: "quiz" },
];

export function Sidebar() {
  const [activeSection, setActiveSection] = useState("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const addTab = useWorkspaceStore((s) => s.addTab);

  const conversations = useConversationsStore((s) => s.conversations);
  const loadConversations = useConversationsStore((s) => s.loadConversations);

  const bookmarks = useBookmarksStore((s) => s.bookmarks);
  const loadBookmarks = useBookmarksStore((s) => s.loadBookmarks);

  const flashcards = useFlashcardsStore((s) => s.flashcards);
  const loadFlashcards = useFlashcardsStore((s) => s.loadFlashcards);

  const searchResults = useSearchStore((s) => s.results);
  const searchLoading = useSearchStore((s) => s.loading);
  const doSearch = useSearchStore((s) => s.search);
  const clearSearch = useSearchStore((s) => s.clearSearch);

  useEffect(() => {
    loadConversations();
    loadBookmarks();
    loadFlashcards();
  }, [loadConversations, loadBookmarks, loadFlashcards]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (value.trim()) {
        doSearch(value);
      } else {
        clearSearch();
      }
    },
    [doSearch, clearSearch],
  );

  return (
    <div className="flex h-full flex-col bg-surface-alt" style={{ borderRight: "1px solid var(--color-border)" }}>
      <div className="p-3">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="px-2 pb-1">
        <PluginSlot slot="sidebar:top" />
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
            }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              activeSection === section.id
                ? "bg-surface text-text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <SectionIcon id={section.id} />
            </span>
            {section.label}
            {section.id === "flashcards" && flashcards.length > 0 && (
              <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                {flashcards.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {searchQuery.trim() ? (
          <SearchResultsPanel results={searchResults} loading={searchLoading} />
        ) : (
          <SectionContent
            section={activeSection}
            conversations={conversations}
            bookmarks={bookmarks}
            flashcards={flashcards}
            onOpenConversation={(conv) => {
              addTab("chat", conv.title);
            }}
            onOpenFlashcard={() => {
              addTab("flashcards", "Flashcards");
            }}
            onStartQuiz={() => {
              addTab("quiz", "Quiz");
            }}
          />
        )}
      </div>

      <div className="px-2 pb-2 pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
        <PluginSlot slot="sidebar:bottom" />
        <button
          onClick={() => addTab("settings", "Settings")}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  );
}

function SectionIcon({ id }: { id: string }) {
  const props = { width: 14, height: 14, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (id) {
    case "conversations":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "flashcards":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "bookmarks":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return null;
  }
}

function SearchResultsPanel({
  results,
  loading,
}: {
  results: { conversationId: string; content: string; score: number }[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="mt-3 text-center text-xs text-text-muted py-8">Searching...</div>;
  }
  if (results.length === 0) {
    return <div className="mt-3 text-center text-xs text-text-muted py-8">No results found</div>;
  }
  return (
    <div className="mt-3 space-y-1">
      <p className="px-1 text-[10px] font-medium text-text-muted uppercase tracking-wider">
        Search Results ({results.length})
      </p>
      {results.map((r, i) => (
        <div
          key={`${r.conversationId}-${i}`}
          className="rounded-lg px-2.5 py-2 text-xs text-text-secondary hover:bg-surface-hover cursor-pointer transition-colors"
        >
          <p className="line-clamp-2 leading-relaxed">{r.content}</p>
        </div>
      ))}
    </div>
  );
}

function SectionContent({
  section,
  conversations,
  bookmarks,
  flashcards,
  onOpenConversation,
  onOpenFlashcard,
  onStartQuiz,
}: {
  section: string;
  conversations: { id: string; title: string; snippet: string; updatedAt: string }[];
  bookmarks: { id: string; label: string; note: string }[];
  flashcards: { id: string; question: string; answer: string; confidence: number }[];
  onOpenConversation: (conv: { id: string; title: string }) => void;
  onOpenFlashcard: () => void;
  onStartQuiz: () => void;
}) {
  if (section === "conversations") {
    if (conversations.length === 0) {
      return (
        <div className="text-center text-xs text-text-muted py-8">
          No conversations yet
        </div>
      );
    }
    return (
      <div className="mt-3 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onOpenConversation(conv)}
            className="w-full rounded-lg px-2.5 py-2 text-left text-xs hover:bg-surface-hover transition-colors group"
          >
            <p className="font-medium text-text-primary truncate">{conv.title}</p>
            {conv.snippet && (
              <p className="text-text-muted truncate mt-0.5">{conv.snippet}</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (section === "flashcards") {
    if (flashcards.length === 0) {
      return (
        <div className="text-center text-xs text-text-muted py-8">
          No flashcards yet
        </div>
      );
    }
    return (
      <div className="mt-3 space-y-2">
        <button
          onClick={onStartQuiz}
          className="w-full rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Start Quiz ({flashcards.length} cards)
        </button>
        <div className="mt-2 space-y-1">
          {flashcards.slice(0, 10).map((fc) => (
            <div
              key={fc.id}
              onClick={onOpenFlashcard}
              className="rounded-lg px-2.5 py-2 text-xs cursor-pointer hover:bg-surface-hover transition-colors"
            >
              <p className="text-text-primary truncate">{fc.question}</p>
              <p className="text-text-muted truncate mt-0.5">
                Confidence: {fc.confidence}/5
              </p>
            </div>
          ))}
          {flashcards.length > 10 && (
            <p className="text-center text-[10px] text-text-muted pt-1">
              +{flashcards.length - 10} more
            </p>
          )}
        </div>
      </div>
    );
  }

  if (section === "bookmarks") {
    if (bookmarks.length === 0) {
      return (
        <div className="text-center text-xs text-text-muted py-8">
          No bookmarks yet
        </div>
      );
    }
    return (
      <div className="mt-3 space-y-1">
        {bookmarks.map((bm) => (
          <div
            key={bm.id}
            className="rounded-lg px-2.5 py-2 text-xs hover:bg-surface-hover transition-colors"
          >
            <p className="text-text-primary truncate">{bm.label || "Untitled"}</p>
            {bm.note && (
              <p className="text-text-muted line-clamp-2 mt-0.5">{bm.note}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section === "quiz") {
    if (flashcards.length === 0) {
      return (
        <div className="text-center text-xs text-text-muted py-8">
          Create flashcards to start a quiz
        </div>
      );
    }
    return (
      <div className="mt-3 text-center">
        <p className="text-xs text-text-muted mb-3">
          {flashcards.length} cards ready for review
        </p>
        <button
          onClick={onStartQuiz}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  return null;
}

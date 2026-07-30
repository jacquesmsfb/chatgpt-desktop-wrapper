import { create } from "zustand";
import { nanoid } from "nanoid";

export type TabType = "chat" | "flashcards" | "quiz" | "search" | "bookmarks" | "settings";

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  url?: string;
}

export interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string | null;
  folders: { id: string; name: string; children: string[] }[];
  addTab: (type: TabType, title: string) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (from: number, to: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  tabs: [],
  activeTabId: null,
  folders: [],

  addTab: (type, title) => {
    const id = nanoid();
    const tab: Tab = { id, type, title };
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: id }));
    return id;
  },

  removeTab: (id) => {
    set((s) => {
      const tabs = s.tabs.filter((t) => t.id !== id);
      const activeTabId =
        s.activeTabId === id
          ? tabs[tabs.length - 1]?.id ?? null
          : s.activeTabId;
      return { tabs, activeTabId };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  reorderTabs: (from, to) => {
    set((s) => {
      const tabs = [...s.tabs];
      const [moved] = tabs.splice(from, 1);
      if (moved) tabs.splice(to, 0, moved);
      return { tabs };
    });
  },
}));

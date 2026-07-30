import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Bookmark } from "@/types";

interface BookmarksState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  loadBookmarks: () => Promise<void>;
  createBookmark: (bookmark: Bookmark) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
}

export const useBookmarksStore = create<BookmarksState>((set) => ({
  bookmarks: [],
  loading: false,
  error: null,

  loadBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const bookmarks = await invoke<Bookmark[]>("list_bookmarks");
      set({ bookmarks, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createBookmark: async (bookmark) => {
    try {
      await invoke("create_bookmark", { bookmark });
      set((s) => ({ bookmarks: [bookmark, ...s.bookmarks] }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteBookmark: async (id) => {
    try {
      await invoke("delete_bookmark", { id });
      set((s) => ({
        bookmarks: s.bookmarks.filter((b) => b.id !== id),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));

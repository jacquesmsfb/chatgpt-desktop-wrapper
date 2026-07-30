import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Conversation } from "@/types";

interface ConversationsState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  saveConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  loading: false,
  error: null,

  loadConversations: async () => {
    set({ loading: true, error: null });
    try {
      const conversations = await invoke<Conversation[]>("list_conversations");
      set({ conversations, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  saveConversation: async (conversation) => {
    try {
      await invoke("save_conversation", { conversation });
      set((s) => {
        const exists = s.conversations.find((c) => c.id === conversation.id);
        if (exists) {
          return {
            conversations: s.conversations.map((c) =>
              c.id === conversation.id ? conversation : c
            ),
          };
        }
        return { conversations: [conversation, ...s.conversations] };
      });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteConversation: async (id) => {
    try {
      await invoke("delete_conversation", { id });
      set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));

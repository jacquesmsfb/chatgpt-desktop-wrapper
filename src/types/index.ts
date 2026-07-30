export interface Conversation {
  id: string;
  title: string;
  url: string;
  snippet: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface Flashcard {
  id: string;
  conversationId: string;
  question: string;
  answer: string;
  confidence: number;
  nextReview: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  conversationId: string;
  messageId: string;
  label: string;
  note: string;
  createdAt: string;
}

export interface SearchResult {
  conversationId: string;
  messageId: string;
  content: string;
  score: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export type PluginSlot = "sidebar:top" | "sidebar:bottom" | "toolbar" | "chat:toolbar" | "settings" | "contextMenu";

export type PluginLifecycleHook = "onActivate" | "onDeactivate" | "onTabChange" | "onThemeChange";

export interface PluginCommand {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
}

export interface PluginShortcut {
  keys: string;
  actionId: string;
  label: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  slot: PluginSlot;
  enabled: boolean;
  config?: Record<string, unknown>;
  commands?: PluginCommand[];
  shortcuts?: PluginShortcut[];
  hooks?: PluginLifecycleHook[];
}

export interface PluginInstance {
  manifest: PluginManifest;
  component: React.ComponentType<unknown>;
}

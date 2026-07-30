# ChatGPT Desktop Wrapper — Architecture

## Technologies

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Desktop | **Tauri v2** | ~5MB binary, Rust safety, sandboxed webview, native perf |
| Backend | **Rust** | Tauri backend; handles FS, SQLite, IPC, window mgmt |
| Frontend | **React 18 + TypeScript** | Component model, ecosystem, typing |
| Build | **Vite** | Fast HMR, Tauri v2 first-class support |
| Styling | **Tailwind CSS v3** | Utility-first, small bundle with purging |
| State | **Zustand** | Minimal boilerplate, TS-first, middleware support |
| Persistence | **SQLite (rusqlite via Tauri)** | Reliable, zero-config, embedded |
| Testing | **Vitest + Playwright** | Vite-native testing, Tauri-compatible E2E |
| Linting | **ESLint + Prettier** | Standard TS tooling |
| Package Manager | **pnpm** | Fast, strict, monorepo-ready |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Tauri Shell (Rust)                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │            Main Window (Webview)                 │ │
│  │  ┌──────────┬────────────────┬──────────┐       │ │
│  │  │  Primary  │    Main Area   │ Secondary │       │ │
│  │  │  Sidebar  │                │  Sidebar  │       │ │
│  │  │  ─────── │  ┌──────────┐ │  ──────── │       │ │
│  │  │  Folders  │  │ChatGPT   │ │  Notes    │       │ │
│  │  │  Sessions │  │Webview   │ │  Prompts  │       │ │
│  │  │  Bookmarks│  │          │ │  Snippets │       │ │
│  │  │  Tags     │  └──────────┘ │  History  │       │ │
│  │  └──────────┴────────────────┴──────────┘       │ │
│  │  ┌──────────────────────────────────────────────┐ ││
│  │  │               Status Bar                      │ │
│  │  └──────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │          Secondary Windows (Floating)            │  │
│  │  Quiz Window · Mind Map · Quick Note · Toolbox  │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Process Model

```
┌───────────────────────────┐
│   Tauri Rust Process       │
│  ┌───────────────────────┐│
│  │ Window Manager         ││
│  │ SQLite (rusqlite)      ││
│  │ File System            ││
│  │ Global Shortcuts       ││
│  │ Tray                   ││
│  │ Auto-Updater           ││
│  │ Notification System    ││
│  └───────────────────────┘│
│         │ IPC (invoke)     │
│         ▼                  │
│  ┌───────────────────────┐│
│  │ React Frontend         ││
│  │  (Main Webview)        ││
│  │                        ││
│  │ ┌───────────────────┐  ││
│  │ │ ChatGPT Webview    │  ││
│  │ │ (iframe/webview)   │  ││
│  │ └───────────────────┘  ││
│  └───────────────────────┘│
└───────────────────────────┘
```

### ChatGPT Webview Strategy

The ChatGPT webview is embedded using Tauri's `WebviewWindow` multiplexed into a split-pane layout. Key design:

1. **Isolated session**: The webview maintains its own cookie store, localStorage, and cache — separate from any system browser. The user logs into ChatGPT once, and the session persists via Tauri's webview storage.

2. **Bridge injection**: On page load, Tauri injects a `__CHATGPT_DESKTOP_BRIDGE__` content script into the ChatGPT webview via `Webview::eval()`. This script:
   - Exposes a `window.__bridge` object for IPC
   - Intercepts `fetch()` calls to capture conversation metadata
   - Listens for React internal state updates to detect new messages
   - Adds custom keyboard shortcuts
   - Sends conversation snapshots to the Tauri backend

3. **Communication flow**:
   ```
   ChatGPT Webview                    Main Window UI                  Tauri Rust
   ─────────────────────────────────────────────────────────────────────
   new message → bridge.postMessage ──→ Zustand store ──→ invoke() ──→ SQLite
                                                                       ↓
   keyboard shortcut ← bridge.dispatch ←─ Tauri event ←─ emit() ─────
   ```

4. **CSP and security**: The ChatGPT webview uses a separate Tauri window with CSP headers. The bridge only communicates via Tauri's `emit()` and `listen()` — no direct DOM access between windows.

---

## Folder Structure

```
chatgpt-desktop-wrapper/
├── src-tauri/                     # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── lib.rs                 # Module exports
│   │   ├── commands/              # Tauri IPC commands
│   │   │   ├── mod.rs
│   │   │   ├── window.rs          # Window management
│   │   │   ├── storage.rs         # SQLite operations
│   │   │   ├── filesystem.rs      # File read/write
│   │   │   ├── shortcuts.rs       # Global shortcuts
│   │   │   ├── tray.rs            # System tray
│   │   │   ├── updater.rs         # Auto-update
│   │   │   └── notifications.rs   # Native notifications
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── migrations.rs      # Schema migrations
│   │   │   ├── conversations.rs   # Chat CRUD
│   │   │   ├── folders.rs
│   │   │   ├── bookmarks.rs
│   │   │   ├── notes.rs
│   │   │   ├── prompts.rs
│   │   │   ├── flashcards.rs
│   │   │   ├── tags.rs
│   │   │   └── settings.rs
│   │   ├── bridge/               # ChatGPT webview bridge
│   │   │   ├── mod.rs
│   │   │   ├── injector.rs       # Script injection
│   │   │   ├── protocol.rs       # Message protocol
│   │   │   └── session.rs        # Session management
│   │   ├── plugins/              # Plugin system (Rust-side)
│   │   │   ├── mod.rs
│   │   │   ├── registry.rs
│   │   │   └── sandbox.rs
│   │   └── utils/
│   │       ├── mod.rs
│   │       ├── crypto.rs         # Encryption helpers
│   │       └── logging.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json            # Tauri configuration
│   └── capabilities/              # Tauri v2 capabilities
│       └── default.json
├── src/                            # React frontend
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Root component
│   ├── components/
│   │   ├── shell/                 # App shell
│   │   │   ├── AppShell.tsx
│   │   │   ├── TitleBar.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── WindowControls.tsx
│   │   ├── sidebar/              # Primary sidebar
│   │   │   ├── PrimarySidebar.tsx
│   │   │   ├── FolderTree.tsx
│   │   │   ├── SessionList.tsx
│   │   │   ├── BookmarkList.tsx
│   │   │   └── TagList.tsx
│   │   ├── webview/              # ChatGPT webview container
│   │   │   ├── WebviewContainer.tsx
│   │   │   ├── WebviewBridge.ts
│   │   │   └── LoadingOverlay.tsx
│   │   ├── sidebar-secondary/    # Secondary sidebar
│   │   │   ├── SecondarySidebar.tsx
│   │   │   ├── NotesPanel.tsx
│   │   │   ├── PromptLibrary.tsx
│   │   │   ├── CodeSnippets.tsx
│   │   │   └── SearchPanel.tsx
│   │   ├── workspace/            # Workspace features
│   │   │   ├── WorkspaceTabs.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── SplitPane.tsx
│   │   ├── learning/             # Learning features
│   │   │   ├── FlashcardViewer.tsx
│   │   │   ├── QuizPanel.tsx
│   │   │   ├── MCQButton.tsx
│   │   │   └── ScoreTracker.tsx
│   │   ├── command-palette/      # Command palette
│   │   │   ├── CommandPalette.tsx
│   │   │   └── CommandRegistry.ts
│   │   ├── floating/             # Floating windows
│   │   │   ├── FloatingToolbox.tsx
│   │   │   └── QuickNote.tsx
│   │   ├── settings/             # Settings UI
│   │   │   ├── SettingsDialog.tsx
│   │   │   ├── ThemePicker.tsx
│   │   │   └── ShortcutManager.tsx
│   │   ├── plugins/              # Plugin UI
│   │   │   ├── PluginManager.tsx
│   │   │   └── PluginHost.tsx
│   │   └── ui/                   # Shared primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Dialog.tsx
│   │       ├── Dropdown.tsx
│   │       ├── Tooltip.tsx
│   │       ├── ResizableHandle.tsx
│   │       ├── Kbd.tsx
│   │       └── ScrollArea.tsx
│   ├── stores/                   # Zustand stores
│   │   ├── useWorkspaceStore.ts
│   │   ├── useSessionStore.ts
│   │   ├── useSidebarStore.ts
│   │   ├── useWebviewStore.ts
│   │   ├── useNotesStore.ts
│   │   ├── useBookmarkStore.ts
│   │   ├── useLearningStore.ts
│   │   ├── useCommandStore.ts
│   │   ├── usePluginStore.ts
│   │   └── useSettingsStore.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── useTauriEvent.ts
│   │   ├── useGlobalShortcut.ts
│   │   ├── useWebviewBridge.ts
│   │   ├── useTheme.ts
│   │   └── useAutoSave.ts
│   ├── lib/                      # Utilities
│   │   ├── commands.ts           # Tauri invoke wrappers
│   │   ├── bridge.ts             # Webview bridge client
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── styles/
│   │   ├── globals.css           # Tailwind base
│   │   └── themes.ts             # Theme tokens
│   ├── inject/                   # ChatGPT webview bridge
│   │   ├── bridge.ts             # Content script
│   │   ├── shortcuts.ts          # In-page shortcuts
│   │   └── observer.ts           # MutationObserver logic
│   └── plugins/                  # Plugin definitions
│       ├── types.ts
│       └── registry.ts
├── public/
│   └── icons/
├── plugins/                      # Plugin packages (future)
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── scripts/
│   ├── build.ts
│   └── release.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PLUGINS.md
│   ├── CONTRIBUTING.md
│   └── DEVELOPMENT.md
├── electron/  (not used - for reference only)
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── playwright.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
└── README.md
```

---

## Component Hierarchy

```
<App>
  <AppShell>
    <TitleBar />
    <div class="layout">
      <PrimarySidebar>
        <WorkspaceTabs>
          <TabBar />
        </WorkspaceTabs>
        <FolderTree />
        <SessionList />
        <BookmarkList />
        <TagList />
      </PrimarySidebar>
      <SplitPane>
        <WebviewContainer>
          <LoadingOverlay />
          {/* Tauri webview element */} 
        </WebviewContainer>
        <SecondarySidebar>
          <NotesPanel />
          <PromptLibrary />
          <CodeSnippets />
          <SearchPanel />
        </SecondarySidebar>
      </SplitPane>
    </div>
    <StatusBar />
    <CommandPalette />
    <FloatingToolbox />
    <QuickNote />
    <SettingsDialog />
    <PluginManager />
    <FlashcardViewer />
    <QuizPanel />
  </AppShell>
</App>
```

---

## IPC Architecture

### Tauri Commands (Rust → Frontend)

Commands are organized by domain. The frontend calls them via `@tauri-apps/api/core::invoke()`.

| Command Domain | Examples |
|----------------|----------|
| **Window** | `create_window`, `close_window`, `toggle_pin`, `set_size`, `set_position` |
| **Storage** | `get_conversations`, `save_conversation`, `delete_conversation`, `search_conversations` |
| **Folders** | `create_folder`, `rename_folder`, `move_to_folder`, `delete_folder` |
| **Bookmarks** | `add_bookmark`, `remove_bookmark`, `get_bookmarks` |
| **Notes** | `save_note`, `get_note`, `list_notes`, `delete_note` |
| **Prompts** | `save_prompt`, `get_prompts`, `delete_prompt`, `reorder_prompts` |
| **Flashcards** | `create_card`, `review_card`, `get_due_cards`, `get_stats` |
| **Settings** | `get_setting`, `set_setting`, `get_all_settings`, `reset_settings` |
| **Filesystem** | `read_file`, `write_file`, `pick_file`, `pick_directory` |
| **Updates** | `check_update`, `install_update`, `get_update_status` |
| **Notifications** | `show_notification`, `request_permission` |
| **Plugins** | `load_plugin`, `unload_plugin`, `get_plugin_list` |
| **Tray** | `set_tray_icon`, `show_tray_notification` |

### Tauri Events (Bidirectional)

Events are used for real-time communication.

| Event | Direction | Purpose |
|-------|-----------|---------|
| `bridge:new-message` | Webview → Frontend | New ChatGPT message detected |
| `bridge:conversation-change` | Webview → Frontend | User switched conversation |
| `bridge:page-navigate` | Webview → Frontend | ChatGPT page changed |
| `bridge:auth-state` | Webview → Frontend | Login/logout state |
| `workspace:tab-changed` | Frontend → Rust | Active tab changed |
| `global:shortcut` | Rust → Frontend | System-wide shortcut fired |
| `window:state-changed` | Rust → Frontend | Window minimized/maximized |
| `update:available` | Rust → Frontend | New version ready |
| `plugin:action` | Plugins → Frontend | Plugin-triggered action |
| `tray:action` | Rust → Frontend | Tray menu item clicked |

---

## State Management (Zustand)

### Store Architecture

Each store is independent. Cross-store communication happens through React hooks or Tauri events — not store-to-store imports.

```
useSettingsStore    → Global config (theme, shortcuts, preferences)
useWorkspaceStore   → Tabs, active tab, layout state
useSidebarStore     → Sidebar visibility, active panel, widths
useSessionStore     → Active ChatGPT session, auth state
useWebviewStore     → Webview loading state, URL, navigation history
useNotesStore       → Notes CRUD, active note
useBookmarkStore    → Bookmarks CRUD, active bookmark
useLearningStore    → Flashcards, quiz state, scores
useCommandStore     → Command palette items, open/close
usePluginStore      → Plugin list, states, registrations
```

### Data Flow Pattern

```
User Action
    │
    ▼
React Component
    │
    ├── Zustand Store (local sync)
    │
    └── Tauri invoke() ──→ Rust Command ──→ SQLite
                                              │
                                              ▼
                                         Response
                                              │
                                              ▼
                                    Zustand Store update
                                              │
                                              ▼
                                    React re-render
```

---

## Database Schema (SQLite)

```sql
-- Conversations tracked from ChatGPT
CREATE TABLE conversations (
    id          TEXT PRIMARY KEY,       -- ChatGPT conversation ID
    title       TEXT NOT NULL DEFAULT '',
    url         TEXT NOT NULL,          -- Full URL to the conversation
    model       TEXT,                   -- Detected model (GPT-4, etc.)
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at   TEXT,                   -- Last time we synced from webview
    metadata    TEXT DEFAULT '{}'       -- JSON blob for extensibility
);

-- Messages captured from the webview bridge
CREATE TABLE messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content         TEXT NOT NULL,
    sequence_num    INTEGER NOT NULL,
    tokens          INTEGER,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    metadata        TEXT DEFAULT '{}'
);

-- Folders for organizing conversations
CREATE TABLE folders (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    parent_id   TEXT REFERENCES folders(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Conversation-folder mapping (M:N)
CREATE TABLE conversation_folders (
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    folder_id       TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, folder_id)
);

-- Tags (shared across entities)
CREATE TABLE tags (
    id    TEXT PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1'
);

CREATE TABLE conversation_tags (
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tag_id          TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, tag_id)
);

-- Bookmarks
CREATE TABLE bookmarks (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id      TEXT REFERENCES messages(id) ON DELETE SET NULL,
    label           TEXT NOT NULL,
    note            TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Notes (user-written, attached to conversations or standalone)
CREATE TABLE notes (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
    title           TEXT NOT NULL DEFAULT '',
    content         TEXT NOT NULL DEFAULT '',      -- Markdown
    is_markdown     INTEGER NOT NULL DEFAULT 1,
    pinned          INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Prompt library
CREATE TABLE prompts (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    category    TEXT DEFAULT 'general',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Flashcards (generated from conversations)
CREATE TABLE flashcards (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    confidence      REAL NOT NULL DEFAULT 0.0,     -- 0.0 to 1.0
    ease_factor     REAL NOT NULL DEFAULT 2.5,      -- SM-2 algorithm
    interval_days   INTEGER NOT NULL DEFAULT 0,
    repetitions     INTEGER NOT NULL DEFAULT 0,
    next_review_at  TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Flashcard review history
CREATE TABLE flashcard_reviews (
    id          TEXT PRIMARY KEY,
    card_id     TEXT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    quality     INTEGER NOT NULL CHECK(quality BETWEEN 0 AND 5),  -- SM-2 scale
    reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quiz sessions
CREATE TABLE quiz_sessions (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
    score           INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    time_limit_secs INTEGER,
    completed_at    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question    TEXT NOT NULL,
    options     TEXT NOT NULL,                     -- JSON array
    correct_idx INTEGER NOT NULL,
    answer_idx  INTEGER,
    time_taken  INTEGER,                           -- milliseconds
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code snippets
CREATE TABLE code_snippets (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
    language        TEXT NOT NULL DEFAULT '',
    title           TEXT NOT NULL DEFAULT '',
    code            TEXT NOT NULL,
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Application settings (key-value with JSON values)
CREATE TABLE settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL DEFAULT '',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Plugin storage (for plugin data persistence)
CREATE TABLE plugin_data (
    plugin_id   TEXT NOT NULL,
    key         TEXT NOT NULL,
    value       TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (plugin_id, key)
);
```

---

## Plugin Architecture

### Design Principles

1. **Extension points only** — Plugins cannot modify core. They register into predefined slots.
2. **Manifest-driven** — Each plugin has a `manifest.json` declaring capabilities.
3. **Sandboxed** — Plugins run in a restricted context. No direct filesystem access.
4. **Lifecycle managed** — `onLoad`, `onUnload`, `onActivate`, `onDeactivate`.

### Extension Points (Day One)

| Extension Point | What Plugins Can Do |
|----------------|---------------------|
| `sidebar:panel` | Add a panel to the secondary sidebar |
| `command:register` | Add commands to the command palette |
| `shortcut:register` | Add keyboard shortcuts |
| `webview:inject` | Inject CSS/JS into the ChatGPT webview |
| `store:subscribe` | Subscribe to store changes |
| `menu:contribute` | Add items to context menus |
| `toolbar:button` | Add buttons to the toolbar |
| `event:listen` | Listen to application events |

### Manifest Format

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Does something useful",
  "author": "You",
  "contributes": {
    "sidebarPanels": [],
    "commands": [],
    "shortcuts": [],
    "webviewScripts": []
  },
  "permissions": ["storage:read", "storage:write"]
}
```

### Lifecycle

```
Plugin discovered → manifest validated → onLoad() called
                                              │
                                    register extension points
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              onActivate()       onDeactivate()
                                    │                   │
                              User interacts      Clean up state
                                    │                   │
                              onUnload() ←── Plugin removed
```

---

## Window Lifecycle

```
App Launch
    │
    ▼
Rust main() ──→ Tauri Builder ──→ Create Main Window
    │                                   │
    │                                   ▼
    │                            Load React App
    │                                   │
    │                                   ▼
    │                            Initialize Stores
    │                                   │
    │                                   ▼
    │                            Load Settings
    │                                   │
    │                                   ▼
    │                            Create ChatGPT Webview
    │                                   │
    │                                   ▼
    │                            Inject Bridge Script
    │                                   │
    │                                   ▼
    │                            Restore Session
    │                                   │
    │                                   ▼
    │                            Ready
    │
    ▼
Tray Icon ←─── Show/Hide Window
    │
    ▼
Global Shortcuts (registered)
```

---

## Security Model

| Concern | Strategy |
|---------|----------|
| **ChatGPT auth tokens** | Stored in webview's isolated storage (not exposed to Rust/JS) |
| **Local data** | SQLite file with standard OS permissions. Optional encryption at rest |
| **IPC** | All Tauri commands require explicit allowlist entries. No arbitrary command execution |
| **Webview isolation** | ChatGPT webview runs in a separate webview with its own origin |
| **Plugin sandbox** | Plugins run in a separate JS context. No `require()`, no `fs`, no `child_process` |
| **Content script** | Injected bridge has no access to Tauri IPC directly — only `emit()`/`listen()` |
| **File access** | File picker dialogs restrict paths. No raw path traversal |
| **Updates** | Signed updates via Tauri updater. HTTPS-only. Checksum verification |
| **CSP** | Strict Content-Security-Policy on all windows |

---

## Error Handling & Logging

### Rust Backend

- All commands return `Result<T, AppError>` with structured error types
- Errors are serialized to JSON and sent to the frontend
- Logging via `tracing` crate (file + stderr)
- Crash recovery: SQLite WAL mode, auto-vacuum

### Frontend

- Error boundaries at each major section (sidebar, webview, panels)
- Global error event listener
- Error display: inline for recoverable, toast for transient, dialog for critical

### Structured Error Response

```typescript
interface CommandError {
  code: string;        // e.g., "DB_CONNECTION_ERROR"
  message: string;     // Human-readable
  details?: unknown;   // Debug info (dev mode only)
}
```

---

## Performance Strategy

| Area | Technique |
|------|-----------|
| **Startup** | Lazy-load secondary panels. Only mount webview on first use |
| **Rendering** | React.memo for sidebar items. Virtual list for long lists (tanstack/virtual) |
| **Webview** | Keep single webview instance. Reuse on tab switch |
| **SQLite** | WAL mode. Prepared statements. Batched writes |
| **IPC** | Debounce frequent emits. Batch bridge messages |
| **Memory** | Unmount hidden tabs. Free unused webview caches |
| **Bundle** | Code-split by route. Vite dynamic imports. Tree-shake Tauri API |

---

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| **Unit (Rust)** | `cargo test` | DB operations, commands, bridge protocol |
| **Unit (React)** | Vitest | Stores, hooks, utilities |
| **Component** | Vitest + Testing Library | UI component behavior |
| **E2E** | Playwright (Tauri) | Full app flows. Requires Tauri binary |
| **Webview bridge** | Unit test inject script with jsdom | Bridge message parsing |

---

## Build & Release Pipeline

```
pnpm build
    │
    ├── Vite builds frontend → dist/
    │
    └── Tauri builds app     → src-tauri/target/release/
                │
                ▼
        Platform binary
                │
                ▼
        Tauri updater (signed)
                │
                ▼
        GitHub Releases
```

### CI Flow (GitHub Actions)

```
PR opened → lint → test (vitest) → test (cargo) → build
                                                      │
                                                      ▼
Release tag → build (macOS/Windows/Linux) → sign → publish
```

---

## Phase Breakdown

| Phase | What We Build | End State |
|-------|--------------|-----------|
| **1 (this doc)** | Complete architecture | Design document |
| **2** | Tauri + React scaffold, pnpm workspace, Tailwind, ESLint, basic window | `pnpm tauri dev` shows a window |
| **3** | TitleBar, WindowControls, StatusBar, Tray, global shortcuts, theme, updater | Desktop shell works |
| **4** | ChatGPT webview, bridge injection, session persistence, keyboard shortcuts | ChatGPT runs embedded |
| **5** | Sidebar, folder tree, session list, SplitPane, workspace tabs, command palette | Full workspace |
| **6** | Flashcard viewer, quiz mode, MCQ system, spaced repetition, study stats | Learning tools |
| **7** | Plugin system: extension points, manifest loading, developer panel | First plugin runs |
| **8** | Performance optimization, animations, edge cases, error handling | Polish |
| **9** | Build scripts, code signing, auto-update, CI/CD, docs | Release-ready |

---

*This document is a living artifact. Update it as architectural decisions evolve.*

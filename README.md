<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" alt="ChatGPT Desktop" width="128" />
</p>

<h1 align="center">ChatGPT Desktop</h1>

<p align="center">
  A professional desktop workspace for ChatGPT — like VS Code for AI conversations.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#plugin-architecture">Plugins</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/Zustand-5-443E38?logo=react" alt="Zustand" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/status-active-success" alt="Status" />
</p>

---

## Features

- **Multi-conversation management** — organize chats in folders, search, bookmark, and review
- **Plugin architecture** — slot-based plugin system with typed manifests and a Zustand registry
- **Flashcard system** — review past conversations as spaced-repetition flashcards
- **Command palette** (`Cmd+K`) — quick actions with merged built-in and plugin commands
- **Dark/light theme** with persistent toggle
- **Native desktop** via Tauri v2 — frameless window, global shortcuts, system notifications, auto-updater

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Rust](https://www.rust-lang.org/) (for Tauri builds)
- macOS 14+ (for native desktop builds)

### Install

```bash
pnpm install
```

### Run (browser)

```bash
pnpm dev
```

Opens at [http://localhost:1420](http://localhost:1420).

### Run (native desktop)

```bash
pnpm tauri:dev
```

### Build

```bash
pnpm build          # web production build
pnpm tauri:build    # native desktop binary
```

## Plugin Architecture

Plugins are typed, slot-based, and registered via a Zustand store. Drop a component into a slot — no routing, no config files.

### Slots

| Slot | Location |
|---|---|
| `sidebar:top` | Top of the sidebar |
| `sidebar:bottom` | Bottom of the sidebar |
| `chat:toolbar` | Chat view toolbar |
| `settings` | Settings panel |
| `contextMenu` | Right-click context menu |

### Create a Plugin

```tsx
import type { PluginInstance } from "@/types";

const helloPlugin: PluginInstance = {
  manifest: {
    id: "hello-world",
    name: "Hello World",
    version: "1.0.0",
    description: "A sample plugin",
    slot: "sidebar:bottom",
    enabled: true,
    commands: [
      { id: "hello.say-hi", label: "Say Hi", icon: "hand", action: () => alert("Hi!") },
    ],
  },
  component: () => (
    <div className="px-3 py-2 text-sm text-muted-foreground">
      Hello from my plugin
    </div>
  ),
};
```

Then register it in `AppShell.tsx`:

```tsx
<PluginRegistry initialPlugins={[helloPlugin, quickActionsPlugin, pluginManagerPlugin]}>
  <App />
</PluginRegistry>
```

### Built-in Plugins

- **QuickActions** — adds a summary action button to the `chat:toolbar` slot
- **PluginManager** — adds plugin controls to the `sidebar:bottom` slot and a command palette entry

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server (browser) |
| `pnpm build` | Typecheck + production build |
| `pnpm preview` | Preview production build |
| `pnpm tauri:dev` | Start Tauri desktop app (dev mode) |
| `pnpm tauri:build` | Build native desktop binary |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm format` | Prettier format |

## Project Structure

```
chatgpt-desktop-wrapper/
├── src/
│   ├── components/       # React UI components
│   │   ├── shell/        # AppShell, layout
│   │   ├── sidebar/      # Conversation list, folders
│   │   ├── chat/         # Chat view, messages
│   │   ├── views/        # Settings, flashcards, search
│   │   └── common/       # Shared UI (CommandPalette, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   ├── plugins/          # Plugin system
│   │   ├── PluginRegistry.tsx   # Context + slot renderer
│   │   └── __registry__/        # Built-in sample plugins
│   ├── stores/           # Zustand stores
│   ├── styles/           # Global CSS
│   ├── test/             # Test setup
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Root component
├── src-tauri/            # Tauri native shell (Rust)
├── .github/              # GitHub workflows
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, Tailwind CSS 3, Lucide icons |
| Language | TypeScript 5.6 |
| Bundler | Vite 6 |
| State | Zustand 5 |
| Desktop | Tauri v2 (Rust) |
| Tests | Vitest + Testing Library, Playwright |
| Linting | ESLint 9, Prettier |
| Package Manager | pnpm |

## License

MIT

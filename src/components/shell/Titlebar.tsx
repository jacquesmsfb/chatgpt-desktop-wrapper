import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/stores/app";

export function Titlebar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const cycleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="flex h-titlebar items-center justify-between bg-surface px-3 select-none"
      style={{
        borderBottom: "1px solid var(--color-border)",
        paddingLeft: "80px",
      }}
    >
      <span className="text-xs font-medium text-text-muted tracking-wide uppercase">
        ChatGPT Desktop
      </span>

      <div className="flex items-center gap-1" data-tauri-drag-region>
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          title="Toggle Sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <button
          onClick={cycleTheme}
          className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          title={`Theme: ${theme}`}
        >
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => appWindow.minimize()}
            className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            title="Minimize"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => appWindow.toggleMaximize()}
            className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            title="Maximize"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </button>
          <button
            onClick={() => appWindow.close()}
            className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-red-500 hover:text-white transition-colors"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

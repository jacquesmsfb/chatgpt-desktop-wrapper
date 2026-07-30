import { useAppStore } from "@/stores/app";

export function StatusBar() {
  const theme = useAppStore((s) => s.theme);

  return (
    <div
      className="flex h-statusbar items-center justify-between px-3 text-xs text-text-muted select-none"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <span>Ready</span>
      <span className="capitalize">{theme}</span>
    </div>
  );
}

import { useEffect } from "react";
import { useAppStore } from "@/stores/app";

export function useTheme() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function apply() {
      const isDark = theme === "dark" || (theme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", isDark);
    }

    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, [theme]);
}

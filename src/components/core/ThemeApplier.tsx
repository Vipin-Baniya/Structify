"use client";
import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useOS }    from "@/hooks/useOS";

/**
 * Invisible client component that sits in the root layout.
 * Reads persisted color-theme and OS preference from localStorage,
 * then applies them to <html> as:
 *   - data-theme="onyx|aurora|slate|parchment|crimson|matrix"
 *   - class "os-macos|os-windows|os-linux|os-android|os-ios"
 *
 * This ensures CSS variables and OS-radius overrides work on first paint.
 */
export function ThemeApplier() {
  const { theme } = useTheme();
  const { os }    = useOS();

  /* Apply data-theme whenever it changes */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* Apply os-{name} class whenever OS changes */
  useEffect(() => {
    const html    = document.documentElement;
    const classes = Array.from(html.classList).filter(c => c.startsWith("os-"));
    classes.forEach(c => html.classList.remove(c));
    if (os !== "default") {
      html.classList.add(`os-${os}`);
    }
  }, [os]);

  return null;
}

"use client";
import { useState } from "react";
import { Palette } from "lucide-react";
import { useTheme, THEME_OPTIONS } from "@/hooks/useTheme";
import type { ColorTheme } from "@/hooks/useTheme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen]     = useState(false);

  const current = THEME_OPTIONS.find(t => t.value === theme) ?? THEME_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Switch color theme"
        className="w-full flex items-center gap-2 py-1 rounded-lg text-xs text-muted hover:text-text transition-all font-mono"
      >
        <span className="text-base leading-none">{current.emoji}</span>
        <span className="text-[11px] flex-1 text-left">{current.label}</span>
        <Palette size={12} className="text-dim" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-50 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <p className="text-[10px] text-dim font-mono uppercase tracking-wider">Choose Color Theme</p>
            </div>
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTheme(opt.value as ColorTheme); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all hover:bg-[var(--accent-2)] text-left"
                style={{ color: theme === opt.value ? "var(--accent)" : "var(--muted)" }}
              >
                {/* Color swatch */}
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-inset"
                  style={{
                    background: opt.preview.accent,
                    boxShadow: `0 0 0 2px ${opt.preview.bg}`,
                    outline: theme === opt.value ? `2px solid ${opt.preview.accent}` : "none",
                    outlineOffset: "1px",
                  }}
                />
                <span className="flex-1">{opt.label}</span>
                {theme === opt.value && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

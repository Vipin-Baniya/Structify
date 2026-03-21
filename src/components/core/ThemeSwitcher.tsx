"use client";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Palette } from "lucide-react";
import { useTheme, THEME_OPTIONS } from "@/hooks/useTheme";
import type { ColorTheme } from "@/hooks/useTheme";

const DROPDOWN_WIDTH = 224; // w-56 = 14rem = 224px

type DropPos = { top?: number; bottom?: number; left: number };

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen]     = useState(false);
  const [dropPos, setDropPos] = useState<DropPos>({ left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect       = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const left       = Math.min(rect.left, window.innerWidth - DROPDOWN_WIDTH - 8);
      if (spaceBelow >= 220) {
        setDropPos({ top: rect.bottom + 8, left });
      } else {
        setDropPos({ bottom: window.innerHeight - rect.top + 8, left });
      }
    }
    setOpen(v => !v);
  }

  const current = THEME_OPTIONS.find(t => t.value === theme) ?? THEME_OPTIONS[0];

  const dropdown = open && (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div
        className="fixed z-[9999] w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
        style={{
          ...(dropPos.top !== undefined
            ? { top: dropPos.top }
            : { bottom: dropPos.bottom }),
          left: dropPos.left,
        }}
      >
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
            <span
              className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-inset"
              style={{
                background:    opt.preview.accent,
                boxShadow:     `0 0 0 2px ${opt.preview.bg}`,
                outline:       theme === opt.value ? `2px solid ${opt.preview.accent}` : "none",
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
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        title="Switch color theme"
        className="w-full flex items-center gap-2 py-1 rounded-lg text-xs text-muted hover:text-text transition-all font-mono"
      >
        <span className="text-base leading-none">{current.emoji}</span>
        <span className="text-[11px] flex-1 text-left">{current.label}</span>
        <Palette size={12} className="text-dim" />
      </button>

      {open && createPortal(dropdown, document.body)}
    </div>
  );
}

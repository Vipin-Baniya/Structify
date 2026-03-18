"use client";
import { useState } from "react";
import { Monitor } from "lucide-react";
import { useOS } from "@/hooks/useOS";
import { OS_OPTIONS } from "@/themes/index";
import type { OSPreference } from "@/hooks/useOS";

export function OSThemeSwitcher() {
  const { preference, setOSPreference } = useOS();
  const [open, setOpen] = useState(false);

  const current = OS_OPTIONS.find(o => o.value === preference) ?? OS_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Switch OS theme"
        className="w-full flex items-center gap-2 py-1 rounded-lg text-xs text-muted hover:text-text transition-all font-mono"
      >
        <span className="text-base leading-none">{current.emoji}</span>
        <span className="text-[11px] flex-1 text-left">{current.label}</span>
        <Monitor size={12} className="text-dim" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-50 w-52 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <p className="text-[10px] text-dim font-mono uppercase tracking-wider">Choose OS Theme</p>
            </div>
            {OS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setOSPreference(opt.value as OSPreference); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all hover:bg-white/5 text-left ${
                  preference === opt.value ? "text-green" : "text-muted"
                }`}
              >
                <span className="w-5 text-base leading-none">{opt.emoji}</span>
                <span className="flex-1">{opt.label}</span>
                {preference === opt.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

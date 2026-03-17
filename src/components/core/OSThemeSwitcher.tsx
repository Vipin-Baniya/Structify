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
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-dim hover:text-muted hover:bg-white/5 transition-all font-mono"
      >
        <span className="text-sm leading-none">{current.emoji}</span>
        <span className="hidden sm:inline text-[11px]">{current.label}</span>
        <Monitor size={11} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-50 w-52 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <p className="text-[10px] text-dim font-mono uppercase tracking-wider">OS Theme</p>
            </div>
            {OS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setOSPreference(opt.value as OSPreference); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all hover:bg-white/5 text-left ${
                  preference === opt.value ? "text-green" : "text-muted"
                }`}
              >
                <span className="w-5 text-base leading-none">{opt.emoji}</span>
                <span>{opt.label}</span>
                {preference === opt.value && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

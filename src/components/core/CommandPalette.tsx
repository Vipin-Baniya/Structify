"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Folder, Cpu, Trophy, Award, BookOpen, ArrowRight, X } from "lucide-react";

/* ── types ─────────────────────────────────────────────────── */
interface SearchResult {
  type:     "project" | "skill" | "achievement" | "certificate" | "blog";
  title:    string;
  subtitle?: string;
  href:     string;
}

/* ── static maps ────────────────────────────────────────────── */
const ICON: Record<string, React.ElementType> = {
  project:     Folder,
  skill:       Cpu,
  achievement: Trophy,
  certificate: Award,
  blog:        BookOpen,
};
const CHIP_COLOR: Record<string, string> = {
  project:     "text-green   bg-green/10",
  skill:       "text-purple-400 bg-purple-500/10",
  achievement: "text-yellow-400 bg-yellow-500/10",
  certificate: "text-blue-400   bg-blue-500/10",
  blog:        "text-cyan-400   bg-cyan-500/10",
};
const CHIP_LABEL: Record<string, string> = {
  project: "Project", skill: "Skill", achievement: "Achievement",
  certificate: "Certificate", blog: "Blog",
};

const QUICK_NAV = [
  { label: "Home",         href: "/home",         emoji: "🏠" },
  { label: "Projects",     href: "/projects",     emoji: "📁" },
  { label: "Skills",       href: "/skills",       emoji: "⚙️" },
  { label: "Achievements", href: "/achievements", emoji: "🏆" },
  { label: "Certificates", href: "/certificates", emoji: "🎓" },
  { label: "Experience",   href: "/experience",   emoji: "💼" },
  { label: "Blog",         href: "/blog",         emoji: "📝" },
  { label: "About",        href: "/about",        emoji: "👤" },
  { label: "Contact",      href: "/contact",      emoji: "✉️" },
];

/* ── component ──────────────────────────────────────────────── */
export function CommandPalette() {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open,     setOpen]     = useState(false);
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(0);

  /* global shortcut ─────────────────────────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(v => !v); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* reset when opened ───────────────────────────────────────── */
  useEffect(() => {
    if (open) {
      setQuery(""); setResults([]); setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  /* search ──────────────────────────────────────────────────── */
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const flat: SearchResult[] = [];

      type RawProject     = { title: string; slug: string; description?: string };
      type RawSkill       = { name: string; category?: string };
      type RawAchievement = { title: string; organization?: string };
      type RawCertificate = { title: string; issuer?: string };
      type RawPost        = { title: string; slug: string; excerpt?: string };

      if (Array.isArray(data.projects))     flat.push(...(data.projects     as RawProject[])    .map(p => ({ type: "project"     as const, title: p.title,  subtitle: p.description,  href: `/projects/${p.slug}` })));
      if (Array.isArray(data.skills))       flat.push(...(data.skills       as RawSkill[])      .map(s => ({ type: "skill"       as const, title: s.name,   subtitle: s.category,     href: "/skills" })));
      if (Array.isArray(data.achievements)) flat.push(...(data.achievements as RawAchievement[]).map(a => ({ type: "achievement" as const, title: a.title,  subtitle: a.organization, href: "/achievements" })));
      if (Array.isArray(data.certificates)) flat.push(...(data.certificates as RawCertificate[]).map(c => ({ type: "certificate" as const, title: c.title,  subtitle: c.issuer,       href: "/certificates" })));
      if (Array.isArray(data.blog))         flat.push(...(data.blog         as RawPost[])       .map(b => ({ type: "blog"        as const, title: b.title,  subtitle: b.excerpt,      href: `/blog/${b.slug}` })));

      setResults(flat.slice(0, 12));
      setSelected(0);
    } catch { setResults([]); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 280);
  }, [query, search]);

  /* keyboard inside palette ─────────────────────────────────── */
  function onPaletteKey(e: React.KeyboardEvent) {
    const items = query.trim().length >= 2 ? results : [];
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && items[selected]) { router.push(items[selected].href); setOpen(false); }
  }

  if (!open) return null;

  const displayItems = query.trim().length >= 2 ? results : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* panel */}
      <div
        className="relative w-full max-w-xl bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a]">
          <Search size={15} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onPaletteKey}
            placeholder="Search projects, skills, achievements…"
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-dim"
          />
          {loading && (
            <span className="w-4 h-4 border-2 border-green/40 border-t-green rounded-full animate-spin shrink-0" />
          )}
          <button onClick={() => setOpen(false)} className="text-dim hover:text-muted transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {/* quick-nav when no query */}
          {query.trim().length < 2 && (
            <div className="p-3">
              <p className="px-2 mb-2 text-[10px] text-dim font-mono uppercase tracking-wider">Quick Navigation</p>
              <div className="grid grid-cols-3 gap-1">
                {QUICK_NAV.map(n => (
                  <button
                    key={n.href}
                    onClick={() => { router.push(n.href); setOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-text hover:bg-white/5 transition-all text-left"
                  >
                    <span>{n.emoji}</span> {n.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* results */}
          {displayItems.length > 0 && (
            <div className="p-2">
              {displayItems.map((item, i) => {
                const Icon  = ICON[item.type] ?? Search;
                const color = CHIP_COLOR[item.type] ?? "text-muted bg-white/5";
                const lbl   = CHIP_LABEL[item.type] ?? item.type;
                return (
                  <button
                    key={`${item.type}-${i}`}
                    onClick={() => { router.push(item.href); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      i === selected ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={13} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-dim truncate">{item.subtitle}</p>}
                    </div>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${color}`}>{lbl}</span>
                    <ArrowRight size={12} className="text-dim shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* empty state */}
          {query.trim().length >= 2 && !loading && displayItems.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-dim text-sm">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[#2a2a2a] bg-[#181818]">
          <span className="text-[10px] text-dim font-mono">↑↓ navigate</span>
          <span className="text-[10px] text-dim font-mono">↵ open</span>
          <span className="text-[10px] text-dim font-mono">esc close</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="text-[9px] bg-[#2a2a2a] text-dim px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            <span className="text-[9px] text-dim">/</span>
            <kbd className="text-[9px] bg-[#2a2a2a] text-dim px-1.5 py-0.5 rounded font-mono">Ctrl K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

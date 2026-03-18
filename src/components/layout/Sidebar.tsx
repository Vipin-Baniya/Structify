"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home, Folder, Trophy, Award, Briefcase,
  Cpu, User, Mail, ChevronRight, Search, BookOpen, Quote,
} from "lucide-react";
import { OSThemeSwitcher } from "@/components/core/OSThemeSwitcher";

const NAV = [
  { href: "/home",         icon: Home,      label: "Home" },
  { href: "/projects",     icon: Folder,    label: "Projects" },
  { href: "/skills",       icon: Cpu,       label: "Skills" },
  { href: "/blog",         icon: BookOpen,  label: "Notes" },
  { href: "/achievements", icon: Trophy,    label: "Achievements" },
  { href: "/certificates", icon: Award,     label: "Certificates" },
  { href: "/experience",   icon: Briefcase, label: "Experience" },
  { href: "/testimonials", icon: Quote,     label: "Testimonials" },
  { href: "/about",        icon: User,      label: "About" },
  { href: "/contact",      icon: Mail,      label: "Contact" },
];

export default function Sidebar({ active }: { active?: string }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [searchQ, setSearchQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    if (q.length >= 2) router.push(`/search?q=${encodeURIComponent(q)}`);
    else if (q.length === 0) router.push("/search");
  }

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="px-6 py-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-md bg-green flex items-center justify-center text-bg font-black text-xs">S</span>
          <span className="font-black text-text tracking-tight text-sm">Structify</span>
        </Link>
      </div>

      <div className="px-3 pt-3 pb-1">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search…"
              className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-text outline-none focus:border-green/40 transition-colors placeholder:text-dim" />
          </div>
        </form>
        {/* Ctrl+K hint */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="mt-1.5 w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-card border border-border text-dim hover:text-muted hover:border-green/20 transition-all text-[10px] font-mono"
        >
          <span>⌘K · Command palette</span>
          <kbd className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[9px]">Ctrl K</kbd>
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href) || active === label.toLowerCase();
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${isActive ? "bg-green/10 text-green border-l-2 border-green pl-[10px]" : "text-muted hover:text-text hover:bg-white/5"}`}>
              <Icon size={16} className={isActive ? "text-green" : "text-dim group-hover:text-muted"} />
              {label}
              {isActive && <ChevronRight size={12} className="ml-auto text-green/60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border space-y-2">
        <div className="bg-card border border-border rounded-xl px-3 py-2 hover:border-green/30 transition-colors">
          <p className="font-mono text-[9px] text-dim uppercase tracking-wider mb-1.5">Switch OS Theme</p>
          <OSThemeSwitcher />
        </div>
        <p className="font-mono text-[10px] text-dim px-1">Architect: Vipin Baniya</p>
        <p className="font-mono text-[9px] text-border px-1">v1.0.0 · Structify</p>
      </div>
    </aside>
  );
}

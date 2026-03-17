"use client";
import { usePathname, useRouter } from "next/navigation";
import Link   from "next/link";
import { useState } from "react";
import {
  Home, Folder, Cpu, BookOpen, Trophy, Award,
  Briefcase, Quote, User, Mail, Search,
} from "lucide-react";
import PlayerBar           from "@/components/layout/PlayerBar";
import { PlayerProvider }  from "@/components/ui/PlayerContext";
import { CommandPalette }  from "@/components/core/CommandPalette";
import { OSThemeSwitcher } from "@/components/core/OSThemeSwitcher";

const NAV = [
  { href: "/home",         icon: Home,      label: "Home",         emoji: "🏠" },
  { href: "/projects",     icon: Folder,    label: "Projects",     emoji: "📁" },
  { href: "/skills",       icon: Cpu,       label: "Skills",       emoji: "⚙️" },
  { href: "/blog",         icon: BookOpen,  label: "Notes",        emoji: "📝" },
  { href: "/achievements", icon: Trophy,    label: "Achievements", emoji: "🏆" },
  { href: "/certificates", icon: Award,     label: "Certificates", emoji: "🎓" },
  { href: "/experience",   icon: Briefcase, label: "Experience",   emoji: "💼" },
  { href: "/testimonials", icon: Quote,     label: "Testimonials", emoji: "💬" },
  { href: "/about",        icon: User,      label: "About",        emoji: "👤" },
  { href: "/contact",      icon: Mail,      label: "Contact",      emoji: "✉️" },
];

export default function MacLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?:  string;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [searchQ, setSearchQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    router.push(q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  const activeLabel = NAV.find(n => pathname.startsWith(n.href))?.label ?? "Structify";

  return (
    <PlayerProvider>
      <CommandPalette />

      {/* ── macOS-style full-screen window ── */}
      <div className="flex flex-col h-screen font-sans" style={{ background: "#1c1c1e", color: "#f5f5f7" }}>

        {/* Menu bar */}
        <div
          className="shrink-0 h-7 flex items-center px-4 gap-5 text-xs"
          style={{ background: "rgba(22,22,24,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="font-semibold text-[#f5f5f7]">🍎 Structify</span>
          {["File", "View", "Go", "Help"].map(m => (
            <span key={m} className="text-[#a1a1aa] hover:text-white cursor-default transition-colors">{m}</span>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <OSThemeSwitcher />
            <span className="text-[10px] text-[#a1a1aa]">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Finder sidebar */}
          <aside
            className="hidden md:flex flex-col w-52 shrink-0"
            style={{ background: "rgba(36,36,38,0.85)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer hover:opacity-75 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] cursor-pointer hover:opacity-75 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] cursor-pointer hover:opacity-75 transition-opacity" />
              <span className="ml-auto text-[10px] font-mono" style={{ color: "#6b6b6b" }}>Structify</span>
            </div>

            {/* Search */}
            <div className="px-2 pb-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#6b6b6b" }} />
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-lg pl-7 pr-3 py-1.5 text-xs outline-none transition-colors"
                    style={{ background: "#3a3a3c", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f5f7" }}
                  />
                </div>
              </form>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6b6b6b" }}>Favourites</p>
              {NAV.slice(0, 5).map(({ href, icon: Icon, label }) => {
                const on = pathname.startsWith(href) || active === label.toLowerCase();
                return (
                  <Link key={href} href={href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all group"
                    style={{ background: on ? "rgba(10,132,255,0.18)" : "transparent", color: on ? "#0a84ff" : "#d1d1d6" }}
                  >
                    <Icon size={13} style={{ color: on ? "#0a84ff" : "#8e8e93" }} />
                    {label}
                  </Link>
                );
              })}
              <p className="px-2 py-1 mt-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6b6b6b" }}>More</p>
              {NAV.slice(5).map(({ href, icon: Icon, label }) => {
                const on = pathname.startsWith(href) || active === label.toLowerCase();
                return (
                  <Link key={href} href={href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all"
                    style={{ background: on ? "rgba(10,132,255,0.18)" : "transparent", color: on ? "#0a84ff" : "#d1d1d6" }}
                  >
                    <Icon size={13} style={{ color: on ? "#0a84ff" : "#8e8e93" }} />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="px-3 py-2 text-[10px]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#6b6b6b" }}>
              Vipin Baniya · v1.0.0
            </div>
          </aside>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto" style={{ background: "#1c1c1e" }}>
            {/* Window title bar */}
            <div
              className="sticky top-0 z-10 h-10 flex items-center px-4 text-sm"
              style={{ background: "rgba(44,44,46,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#d1d1d6" }}
            >
              <span className="font-medium">{activeLabel}</span>
              <div className="ml-auto text-[10px] font-mono" style={{ color: "#6b6b6b" }}>⌘K to search</div>
            </div>
            <div className="p-6 max-w-6xl mx-auto">{children}</div>
          </main>
        </div>

        {/* macOS Dock */}
        <div className="shrink-0 flex justify-center pb-3 pt-1">
          <div
            className="flex items-end gap-1 px-4 py-2 rounded-2xl"
            style={{ background: "rgba(44,44,46,0.72)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {NAV.slice(0, 8).map(({ href, emoji, label }) => {
              const on = pathname.startsWith(href);
              return (
                <Link key={href} href={href} title={label} className="relative group flex flex-col items-center">
                  <span className={`text-xl transition-all duration-200 group-hover:-translate-y-2 group-hover:scale-125 ${on ? "drop-shadow-lg" : ""}`}>
                    {emoji}
                  </span>
                  {on && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white" />}
                  <span
                    className="absolute bottom-full mb-2 px-2 py-0.5 rounded-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                    style={{ background: "#3a3a3c" }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <PlayerBar />
    </PlayerProvider>
  );
}

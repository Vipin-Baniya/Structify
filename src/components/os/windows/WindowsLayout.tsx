"use client";
import { usePathname, useRouter } from "next/navigation";
import Link   from "next/link";
import { useState } from "react";
import {
  Home, Folder, Cpu, BookOpen, Trophy, Award,
  Briefcase, Quote, User, Mail, Search, Menu, X,
} from "lucide-react";
import PlayerBar           from "@/components/layout/PlayerBar";
import { AdminFAB }        from "@/components/core/AdminFAB";
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

export default function WindowsLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?:  string;
}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [searchQ, setSearchQ] = useState("");
  const [startMenu, setStartMenu] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    router.push(q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <PlayerProvider>
      <CommandPalette />

      <div
        className="flex flex-col h-screen font-sans text-white"
        style={{ background: "linear-gradient(135deg,#202020 0%,#2d2d2d 100%)" }}
      >
        {/* Windows title-bar / task-strip at top */}
        <div
          className="shrink-0 h-10 flex items-center px-3 gap-2"
          style={{ background: "rgba(32,32,32,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* "Start" button */}
          <button
            onClick={() => setStartMenu(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            {startMenu ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#8a8a8a" }} />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search (Ctrl+K)"
                className="w-full rounded-md pl-8 pr-3 py-1 text-xs text-white outline-none transition-colors"
                style={{ background: "rgba(58,58,58,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </form>

          {/* Centred pinned apps */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV.slice(0, 6).map(({ href, emoji, label }) => {
              const on = pathname.startsWith(href) || active === label.toLowerCase();
              return (
                <Link key={href} href={href} title={label}
                  className="relative flex flex-col items-center px-3 py-0.5 rounded-md text-[10px] transition-all gap-0.5"
                  style={{ background: on ? "rgba(255,255,255,0.1)" : "transparent", color: on ? "#fff" : "#aaa" }}
                >
                  <span className="text-sm">{emoji}</span>
                  {on && <span className="absolute bottom-0.5 w-1 h-0.5 rounded-full bg-[#0078d4]" />}
                </Link>
              );
            })}
          </div>

          {/* System tray */}
          <div className="ml-auto flex items-center gap-2">
            <OSThemeSwitcher />
            <span className="text-[10px] text-[#aaa] hidden sm:block">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Start Menu overlay */}
        {startMenu && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center pb-14"
            onClick={() => setStartMenu(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
              style={{ background: "rgba(32,32,32,0.96)", backdropFilter: "blur(40px)", borderColor: "rgba(255,255,255,0.1)" }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs text-[#aaa] mb-4 font-semibold uppercase tracking-wider">Pinned</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {NAV.map(({ href, emoji, label }) => (
                  <Link key={href} href={href} onClick={() => setStartMenu(false)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/10 transition-all">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[10px] text-[#d1d1d6] text-center">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">{children}</div>
        </main>

        {/* Windows Taskbar at bottom */}
        <div
          className="shrink-0 h-12 flex items-center justify-center gap-1 px-3"
          style={{ background: "rgba(32,32,32,0.88)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {NAV.map(({ href, emoji, label }) => {
            const on = pathname.startsWith(href);
            return (
              <Link key={href} href={href} title={label}
                className="relative w-10 h-10 flex items-center justify-center rounded-md transition-all group"
                style={{ background: on ? "rgba(255,255,255,0.15)" : "transparent" }}
              >
                <span className="text-xl">{emoji}</span>
                {on && <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-[#0078d4]" />}
                <span
                  className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                  style={{ background: "#3a3a3a" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <PlayerBar />
      <AdminFAB />
    </PlayerProvider>
  );
}

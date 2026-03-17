"use client";
import { usePathname, useRouter } from "next/navigation";
import Link   from "next/link";
import { useState } from "react";
import {
  Home, Folder, Cpu, BookOpen, Trophy, Award,
  Briefcase, Quote, User, Mail, Search, ArrowLeft,
} from "lucide-react";
import PlayerBar           from "@/components/layout/PlayerBar";
import { PlayerProvider }  from "@/components/ui/PlayerContext";
import { CommandPalette }  from "@/components/core/CommandPalette";
import { OSThemeSwitcher } from "@/components/core/OSThemeSwitcher";

const NAV = [
  { href: "/home",         icon: Home,      label: "Home",         sub: "Dashboard" },
  { href: "/projects",     icon: Folder,    label: "Projects",     sub: "Portfolio work" },
  { href: "/skills",       icon: Cpu,       label: "Skills",       sub: "Tech & tools" },
  { href: "/blog",         icon: BookOpen,  label: "Notes",        sub: "Writing" },
  { href: "/achievements", icon: Trophy,    label: "Achievements", sub: "Awards" },
  { href: "/certificates", icon: Award,     label: "Certificates", sub: "Education" },
  { href: "/experience",   icon: Briefcase, label: "Experience",   sub: "Work history" },
  { href: "/testimonials", icon: Quote,     label: "Testimonials", sub: "Recommendations" },
  { href: "/about",        icon: User,      label: "About",        sub: "My story" },
  { href: "/contact",      icon: Mail,      label: "Contact",      sub: "Get in touch" },
];

// Material 3 colour palette
const M3 = {
  bg:      "#141218",
  surface: "#1c1b1f",
  card:    "#211f26",
  border:  "#2d2b32",
  primary: "#d0bcff",
  onPrimary: "#381e72",
  secondary: "#ccc2dc",
  text:    "#e6e1e5",
  muted:   "#9a9098",
  dim:     "#636069",
};

export default function AndroidLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?:  string;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [searchQ, setSearchQ] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentItem = NAV.find(n => pathname.startsWith(n.href));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    router.push(q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <PlayerProvider>
      <CommandPalette />

      <div
        className="flex flex-col h-screen font-sans"
        style={{ background: M3.bg, color: M3.text }}
      >
        {/* Material Top App Bar */}
        <div
          className="shrink-0 h-14 flex items-center px-4 gap-3"
          style={{ background: M3.surface, borderBottom: `1px solid ${M3.border}` }}
        >
          <button
            onClick={() => setDrawerOpen(v => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: M3.text }}
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-lg font-medium flex-1">{currentItem?.label ?? "Structify"}</span>

          {/* Search bar — Material 3 style */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full cursor-text"
              style={{ background: M3.card }}
              onClick={() => router.push("/search")}
            >
              <Search size={15} style={{ color: M3.muted }} />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search Structify"
                className="bg-transparent text-sm outline-none flex-1"
                style={{ color: M3.text }}
              />
            </div>
          </form>
          <OSThemeSwitcher />
        </div>

        {/* Navigation Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <nav
              className="relative h-full w-72 flex flex-col overflow-y-auto"
              style={{ background: M3.surface, borderRight: `1px solid ${M3.border}` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-6 text-xl font-medium" style={{ color: M3.text }}>Structify</div>
              <div className="flex-1 px-3 space-y-0.5">
                {NAV.map(({ href, icon: Icon, label, sub }) => {
                  const on = pathname.startsWith(href) || active === label.toLowerCase();
                  return (
                    <Link key={href} href={href} onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-4 px-3 py-3 rounded-2xl transition-all"
                      style={{ background: on ? `${M3.primary}22` : "transparent", color: on ? M3.primary : M3.muted }}
                    >
                      <Icon size={20} />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs" style={{ color: M3.dim }}>{sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="px-5 py-4 text-xs" style={{ color: M3.dim }}>Vipin Baniya · v1.0.0</div>
            </nav>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </main>

        {/* Material Bottom Navigation */}
        <div
          className="shrink-0 h-16 flex items-center justify-around px-2"
          style={{ background: M3.surface, borderTop: `1px solid ${M3.border}` }}
        >
          {NAV.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const on = pathname.startsWith(href) || active === label.toLowerCase();
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 group relative">
                {/* Pill indicator */}
                <span
                  className="w-14 h-8 flex items-center justify-center rounded-full transition-all"
                  style={{ background: on ? `${M3.primary}22` : "transparent" }}
                >
                  <Icon size={20} style={{ color: on ? M3.primary : M3.muted }} />
                </span>
                <span className="text-[10px]" style={{ color: on ? M3.primary : M3.muted }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <PlayerBar />
    </PlayerProvider>
  );
}

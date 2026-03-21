"use client";
import { usePathname, useRouter } from "next/navigation";
import Link   from "next/link";
import { useState } from "react";
import {
  Home, Folder, Cpu, BookOpen, Trophy, Award,
  Briefcase, Quote, User, Mail, Search,
} from "lucide-react";
import PlayerBar           from "@/components/layout/PlayerBar";
import { AdminFAB }        from "@/components/core/AdminFAB";
import { PlayerProvider }  from "@/components/ui/PlayerContext";
import { CommandPalette }  from "@/components/core/CommandPalette";
import { OSThemeSwitcher } from "@/components/core/OSThemeSwitcher";
import { ThemeSwitcher }   from "@/components/core/ThemeSwitcher";

const NAV = [
  { href: "/home",         icon: Home,      label: "Home"     },
  { href: "/projects",     icon: Folder,    label: "Projects" },
  { href: "/skills",       icon: Cpu,       label: "Skills"   },
  { href: "/blog",         icon: BookOpen,  label: "Notes"    },
  { href: "/achievements", icon: Trophy,    label: "Awards"   },
  { href: "/certificates", icon: Award,     label: "Certs"    },
  { href: "/experience",   icon: Briefcase, label: "Work"     },
  { href: "/testimonials", icon: Quote,     label: "Reviews"  },
  { href: "/about",        icon: User,      label: "About"    },
  { href: "/contact",      icon: Mail,      label: "Contact"  },
];

// iOS / Apple colours
const iOS = {
  bg:      "#000000",
  surface: "rgba(28,28,30,0.95)",
  card:    "rgba(44,44,46,0.8)",
  border:  "rgba(84,84,88,0.4)",
  blue:    "#0a84ff",
  text:    "#ffffff",
  muted:   "#8e8e93",
  dim:     "#636366",
};

export default function IOSLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?:  string;
}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [searchQ, setSearchQ] = useState("");

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
        className="flex flex-col h-screen font-sans select-none"
        style={{ background: iOS.bg, color: iOS.text }}
      >
        {/* iOS Navigation Bar */}
        <div
          className="shrink-0 px-4 pt-2 pb-2 flex items-center gap-3"
          style={{
            background:    iOS.surface,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom:  `1px solid ${iOS.border}`,
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px]" style={{ color: iOS.muted }}>Vipin Baniya</p>
            <p className="text-base font-semibold truncate">{currentItem?.label ?? "Structify"}</p>
          </div>

          {/* Search field */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[200px]">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(118,118,128,0.24)" }}
            >
              <Search size={13} style={{ color: iOS.muted }} />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search"
                className="bg-transparent text-sm outline-none flex-1 min-w-0"
                style={{ color: iOS.text }}
              />
            </div>
          </form>
          <ThemeSwitcher />
          <OSThemeSwitcher />
        </div>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          <div className="px-4 pt-4 pb-6 max-w-3xl mx-auto">
            {children}
          </div>
        </main>

        {/* iOS Tab Bar */}
        <div
          className="shrink-0 flex items-end justify-around px-1"
          style={{
            background:    iOS.surface,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderTop:     `1px solid ${iOS.border}`,
            paddingBottom: "env(safe-area-inset-bottom, 12px)",
            paddingTop:    "8px",
          }}
        >
          {NAV.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const on = pathname.startsWith(href) || active === label.toLowerCase();
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[52px]"
              >
                <Icon size={22} style={{ color: on ? iOS.blue : iOS.muted }} strokeWidth={on ? 2 : 1.5} />
                <span className="text-[9px]" style={{ color: on ? iOS.blue : iOS.muted }}>{label}</span>
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

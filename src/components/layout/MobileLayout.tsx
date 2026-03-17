"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Home, Folder, Trophy, Award,
  Briefcase, Cpu, User, Mail, Search, BookOpen, Quote,
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

export default function MobileLayout({ active }: { active?: string }) {
  const [open,    setOpen]    = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const pathname              = usePathname();
  const router                = useRouter();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    setOpen(false);
    router.push(q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <>
      {/* Fixed mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-green flex items-center justify-center text-bg font-black text-xs">S</span>
          <span className="font-black text-text tracking-tight text-sm">Structify</span>
        </Link>
        <button onClick={() => setOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
          aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Slide-out drawer */}
      <div className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-surface border-r border-border flex flex-col
          transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="w-7 h-7 rounded-md bg-green flex items-center justify-center text-bg font-black text-xs">S</span>
            <span className="font-black text-text tracking-tight text-sm">Structify</span>
          </Link>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-3 pt-3 pb-1">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search..."
                className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-text outline-none focus:border-green/40 transition-colors placeholder:text-dim" />
            </div>
          </form>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href) || active === label.toLowerCase();
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive ? "bg-green/10 text-green border-l-2 border-green pl-[10px]" : "text-muted hover:text-text hover:bg-white/5"}`}>
                <Icon size={16} className={isActive ? "text-green" : "text-dim"} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-border space-y-1">
          <OSThemeSwitcher />
          <p className="font-mono text-[10px] text-dim">Architect: Vipin Baniya</p>
          <p className="font-mono text-[9px] text-border mt-0.5">v1.0.0 · Structify</p>
        </div>
      </div>
    </>
  );
}

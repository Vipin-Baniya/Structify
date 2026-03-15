"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Folder, Trophy, Award,
  Briefcase, Cpu, User, BookOpen, Quote, BarChart2, ExternalLink, LogOut,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/analytics",    icon: BarChart2,        label: "Analytics" },
  { href: "/admin/projects",     icon: Folder,          label: "Projects" },
  { href: "/admin/skills",       icon: Cpu,             label: "Skills" },
  { href: "/admin/blog",         icon: BookOpen,        label: "Blog" },
  { href: "/admin/achievements", icon: Trophy,          label: "Achievements" },
  { href: "/admin/certificates", icon: Award,           label: "Certificates" },
  { href: "/admin/experience",   icon: Briefcase,       label: "Experience" },
  { href: "/admin/testimonials", icon: Quote,           label: "Testimonials" },
  { href: "/admin/profile",      icon: User,            label: "Profile" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-green flex items-center justify-center text-bg font-black text-[10px]">S</span>
          <div>
            <p className="font-black text-text text-xs">Structify</p>
            <p className="font-mono text-[9px] text-dim">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                ${active ? "bg-green/10 text-green" : "text-muted hover:text-text hover:bg-white/5"}`}>
              <Icon size={14} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-border space-y-1">
        <Link href="/home" target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted hover:text-text transition-colors">
          <ExternalLink size={13} /> View Site
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted hover:text-red-400 transition-colors w-full text-left">
          <LogOut size={13} /> Logout
        </button>
      </div>
    </aside>
  );
}

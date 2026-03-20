"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Trophy, Award, Briefcase, Cpu, ArrowRight, Eye, BarChart2 } from "lucide-react";
import { Project } from "@/types";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    projects: 0, skills: 0, achievements: 0, certificates: 0, experience: 0,
  });
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [totalViews,  setTotalViews]  = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/skills").then(r => r.json()),
      fetch("/api/achievements").then(r => r.json()),
      fetch("/api/certificates").then(r => r.json()),
      fetch("/api/experience").then(r => r.json()),
    ]).then(([p, sk, a, c, e]) => {
      const projects = Array.isArray(p) ? p as Project[] : [];
      setCounts({
        projects:     projects.length,
        skills:       Array.isArray(sk) ? sk.length : 0,
        achievements: Array.isArray(a)  ? a.length  : 0,
        certificates: Array.isArray(c)  ? c.length  : 0,
        experience:   Array.isArray(e)  ? e.length  : 0,
      });
      const total = projects.reduce((sum, proj) => sum + (proj.views || 0), 0);
      setTotalViews(total);
      const sorted = [...projects].sort((a, b) => (b.views || 0) - (a.views || 0));
      setTopProjects(sorted.slice(0, 3));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Projects",     count: counts.projects,     href: "/admin/projects",     icon: Folder,    color: "text-green",       bg: "bg-green/10" },
    { label: "Skills",       count: counts.skills,       href: "/admin/skills",       icon: Cpu,       color: "text-cyan-400",    bg: "bg-cyan-500/10" },
    { label: "Achievements", count: counts.achievements, href: "/admin/achievements", icon: Trophy,    color: "text-yellow-400",  bg: "bg-yellow-500/10" },
    { label: "Certificates", count: counts.certificates, href: "/admin/certificates", icon: Award,     color: "text-blue-400",    bg: "bg-blue-500/10" },
    { label: "Experience",   count: counts.experience,   href: "/admin/experience",   icon: Briefcase, color: "text-purple-400",  bg: "bg-purple-500/10" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-black text-text">Dashboard</h1>
        <Link href="/admin/analytics" className="flex items-center gap-1.5 text-xs text-muted hover:text-green font-mono transition-colors">
          <BarChart2 size={12} /> Analytics <ArrowRight size={10} />
        </Link>
      </div>
      <p className="text-muted text-sm mb-8">Manage your Structify platform.</p>

      {/* Content counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {cards.map(c => (
          <Link key={c.label} href={c.href}
            className="bg-card border border-border rounded-xl p-4 hover:border-green/30 transition-colors group">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon size={16} className={c.color} />
            </div>
            <p className="text-2xl font-black text-text">{c.count}</p>
            <p className="text-xs text-muted mt-0.5">{c.label}</p>
            <p className={`text-[10px] font-mono mt-2 flex items-center gap-1 ${c.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
              Manage <ArrowRight size={9} />
            </p>
          </Link>
        ))}
      </div>

      {/* Views analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Total views card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={14} className="text-green" />
            <p className="font-mono text-[10px] text-muted">TOTAL PROJECT VIEWS</p>
          </div>
          <p className="text-4xl font-black text-text mt-2">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-muted mt-1">across all projects</p>
        </div>

        {/* Top projects by views */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-3">{"// TOP PROJECTS BY VIEWS"}</p>
          {topProjects.length === 0 ? (
            <p className="text-dim text-xs">No views yet.</p>
          ) : (
            <div className="space-y-2">
              {topProjects.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-dim w-4">{i + 1}</span>
                  <Link href={`/projects/${p.slug}`} target="_blank"
                    className="flex-1 text-sm text-text hover:text-green transition-colors truncate">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-1 text-dim">
                    <Eye size={11} />
                    <span className="font-mono text-[11px]">{(p.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-mono text-[10px] text-muted mb-3">{"// QUICK ACTIONS"}</p>
        <div className="grid grid-cols-2 gap-3">
          {cards.map(c => (
            <Link key={c.label} href={c.href}
              className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg hover:border-green/30 transition-colors text-sm">
              <span className="text-text">Add {c.label.slice(0, -1)}</span>
              <ArrowRight size={13} className="text-dim" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

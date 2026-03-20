"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/types";
import { Eye, BarChart2, FileText, Trophy, Award, Briefcase, Cpu, BookOpen, Quote, ArrowRight } from "lucide-react";

interface ContentCounts {
  projects: number;
  skills: number;
  achievements: number;
  certificates: number;
  experience: number;
  posts: number;
  testimonials: number;
}

export default function AdminAnalyticsPage() {
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [counts,    setCounts]    = useState<ContentCounts>({
    projects: 0, skills: 0, achievements: 0,
    certificates: 0, experience: 0, posts: 0, testimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/skills").then(r => r.json()),
      fetch("/api/achievements").then(r => r.json()),
      fetch("/api/certificates").then(r => r.json()),
      fetch("/api/experience").then(r => r.json()),
      fetch("/api/blog?published=false").then(r => r.json()),
      fetch("/api/testimonials").then(r => r.json()),
    ]).then(([p, sk, ach, cert, exp, blog, test]) => {
      const ps = Array.isArray(p) ? p as Project[] : [];
      setProjects(ps);
      setCounts({
        projects:     ps.length,
        skills:       Array.isArray(sk)   ? sk.length   : 0,
        achievements: Array.isArray(ach)  ? ach.length  : 0,
        certificates: Array.isArray(cert) ? cert.length : 0,
        experience:   Array.isArray(exp)  ? exp.length  : 0,
        posts:        Array.isArray(blog) ? blog.length : 0,
        testimonials: Array.isArray(test) ? test.length : 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalViews     = projects.reduce((s, p) => s + (p.views || 0), 0);
  const sortedByViews  = [...projects].sort((a, b) => (b.views || 0) - (a.views || 0));
  const maxViews       = sortedByViews[0]?.views || 1;
  const featuredCount  = projects.filter(p => p.featured).length;
  const statusCounts   = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const contentItems = [
    { label: "Projects",     count: counts.projects,     icon: FileText,  color: "text-green",       bg: "bg-green/10",        href: "/admin/projects" },
    { label: "Skills",       count: counts.skills,       icon: Cpu,       color: "text-cyan-400",    bg: "bg-cyan-500/10",     href: "/admin/skills" },
    { label: "Achievements", count: counts.achievements, icon: Trophy,    color: "text-yellow-400",  bg: "bg-yellow-500/10",   href: "/admin/achievements" },
    { label: "Certificates", count: counts.certificates, icon: Award,     color: "text-blue-400",    bg: "bg-blue-500/10",     href: "/admin/certificates" },
    { label: "Experience",   count: counts.experience,   icon: Briefcase, color: "text-purple-400",  bg: "bg-purple-500/10",   href: "/admin/experience" },
    { label: "Blog Posts",   count: counts.posts,        icon: BookOpen,  color: "text-orange-400",  bg: "bg-orange-500/10",   href: "/admin/blog" },
    { label: "Testimonials", count: counts.testimonials, icon: Quote,     color: "text-pink-400",    bg: "bg-pink-500/10",     href: "/admin/testimonials" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-text mb-1">Analytics</h1>
      <p className="text-muted text-sm mb-8">Platform performance and content overview.</p>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={14} className="text-green" />
            <p className="font-mono text-[10px] text-muted">TOTAL VIEWS</p>
          </div>
          <p className="text-3xl font-black text-text">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-dim mt-1">across {counts.projects} projects</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={14} className="text-green" />
            <p className="font-mono text-[10px] text-muted">AVG VIEWS</p>
          </div>
          <p className="text-3xl font-black text-text">
            {counts.projects > 0 ? Math.round(totalViews / counts.projects).toLocaleString() : 0}
          </p>
          <p className="text-xs text-dim mt-1">per project</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-green" />
            <p className="font-mono text-[10px] text-muted">FEATURED</p>
          </div>
          <p className="text-3xl font-black text-text">{featuredCount}</p>
          <p className="text-xs text-dim mt-1">of {counts.projects} projects</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-green" />
            <p className="font-mono text-[10px] text-muted">TOTAL CONTENT</p>
          </div>
          <p className="text-3xl font-black text-text">
            {Object.values(counts).reduce((s, n) => s + n, 0)}
          </p>
          <p className="text-xs text-dim mt-1">items across all sections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project views bar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-4">{"// PROJECT VIEWS LEADERBOARD"}</p>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-surface rounded animate-pulse" />)}
            </div>
          ) : sortedByViews.length === 0 ? (
            <p className="text-dim text-xs">No projects yet.</p>
          ) : (
            <div className="space-y-2.5">
              {sortedByViews.slice(0, 8).map((p, i) => {
                const pct = maxViews > 0 ? ((p.views || 0) / maxViews) * 100 : 0;
                return (
                  <div key={p._id} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-dim w-4 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/projects/${p.slug}`} target="_blank"
                          className="text-xs text-text hover:text-green transition-colors truncate mr-2">
                          {p.title}
                        </Link>
                        <span className="font-mono text-[10px] text-dim shrink-0">
                          {(p.views || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green/70 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {sortedByViews.length > 8 && (
                <Link href="/admin/projects" className="flex items-center gap-1 text-xs text-dim hover:text-green transition-colors font-mono mt-2">
                  +{sortedByViews.length - 8} more <ArrowRight size={10} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Content distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-4">{"// CONTENT DISTRIBUTION"}</p>
          <div className="space-y-3">
            {contentItems.map(item => {
              const total = Object.values(counts).reduce((s, n) => s + n, 0);
              const pct   = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 group">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon size={12} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text group-hover:text-green transition-colors">{item.label}</span>
                      <span className="font-mono text-[10px] text-dim">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.bg.replace("/10", "/50")}`}
                        style={{ width: `${Math.max(pct, item.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-4">{"// PROJECT STATUS BREAKDOWN"}</p>
          {counts.projects === 0 ? (
            <p className="text-dim text-xs">No projects yet.</p>
          ) : (
            <div className="flex items-end gap-4 h-24">
              {[
                { key: "active",    label: "Active",    color: "bg-green",           text: "text-green" },
                { key: "completed", label: "Completed", color: "bg-blue-500",         text: "text-blue-400" },
                { key: "research",  label: "Research",  color: "bg-purple-500",       text: "text-purple-400" },
              ].map(s => {
                const count = statusCounts[s.key] || 0;
                const pct   = counts.projects > 0 ? (count / counts.projects) * 100 : 0;
                return (
                  <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
                    <span className={`font-mono text-xs ${s.text}`}>{count}</span>
                    <div className="w-full bg-surface rounded-t overflow-hidden" style={{ height: "64px" }}>
                      <div
                        className={`w-full ${s.color} opacity-70 rounded-t transition-all duration-700`}
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-dim text-center">{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links to add content */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-4">{"// QUICK ACTIONS"}</p>
          <div className="grid grid-cols-2 gap-2">
            {contentItems.map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-lg hover:border-green/30 transition-colors group text-xs">
                <item.icon size={12} className={`${item.color} shrink-0`} />
                <span className="text-muted group-hover:text-text transition-colors truncate">
                  Add {item.label.replace(/s$/, "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

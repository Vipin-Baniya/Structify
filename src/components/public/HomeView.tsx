"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project, Achievement, Certificate, Skill } from "@/types";
import { Trophy, Award, ArrowRight, Cpu } from "lucide-react";
import { usePlayer } from "@/components/ui/PlayerContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green/20 text-green",
  completed: "bg-blue-500/20 text-blue-400",
  research:  "bg-purple-500/20 text-purple-400",
};

const SKILL_CATEGORY_COLOR: Record<string, string> = {
  "ai-ml":       "text-purple-400 bg-purple-500/10",
  "full-stack":  "text-green bg-green/10",
  "systems":     "text-orange-400 bg-orange-500/10",
  "power":       "text-yellow-400 bg-yellow-500/10",
  "competitive": "text-blue-400 bg-blue-500/10",
  "tools":       "text-cyan-400 bg-cyan-500/10",
  "other":       "text-muted bg-surface",
};

export default function HomeView() {
  const [projects,     setProjects]     = useState<Project[]>([]);
  const { setProject } = usePlayer();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certs,        setCerts]        = useState<Certificate[]>([]);
  const [skills,       setSkills]       = useState<Skill[]>([]);

  useEffect(() => {
    fetch("/api/projects?featured=true").then(r => r.json()).then(d => Array.isArray(d) && setProjects(d.slice(0, 6)));
    fetch("/api/achievements").then(r => r.json()).then(d => Array.isArray(d) && setAchievements(d.slice(0, 4)));
    fetch("/api/certificates").then(r => r.json()).then(d => Array.isArray(d) && setCerts(d.slice(0, 4)));
    fetch("/api/skills").then(r => r.json()).then(d => Array.isArray(d) && setSkills(d.slice(0, 16)));
  }, []);

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-4xl font-black text-text">{greeting()}, Vipin.</h1>
        <p className="text-muted text-sm mt-1">Welcome to your engineering identity platform.</p>
      </div>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Featured Projects</h2>
          <Link href="/projects" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
            See all <ArrowRight size={12} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <EmptyState message="No projects yet. Add one in the admin panel." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => <ProjectCard key={p._id} project={p} onPlay={setProject} />)}
          </div>
        )}
      </section>

      {/* Skills Playlists strip */}
      {skills.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Tech Stack</h2>
            <Link href="/skills" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => {
              const colorClass = SKILL_CATEGORY_COLOR[s.category] ?? SKILL_CATEGORY_COLOR.other;
              return (
                <Link
                  key={s._id}
                  href="/skills"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-transparent hover:border-current/20 transition-all ${colorClass}`}
                >
                  {s.iconUrl
                    ? <img src={s.iconUrl} alt={s.name} className="w-3.5 h-3.5 object-contain" />
                    : <Cpu size={11} />
                  }
                  {s.name}
                </Link>
              );
            })}
            {skills.length >= 16 && (
              <Link href="/skills" className="px-3 py-1.5 rounded-full text-xs font-mono text-dim bg-card border border-border hover:border-green/30 transition-colors">
                + more →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Achievements + Certs row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Recent Achievements</h2>
            <Link href="/achievements" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
              See all <ArrowRight size={12} />
            </Link>
          </div>
          {achievements.length === 0 ? (
            <EmptyState message="No achievements yet." />
          ) : (
            <div className="space-y-3">
              {achievements.map(a => (
                <div key={a._id} className="bg-card border border-border rounded-xl p-4 flex gap-3 hover:border-green/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <Trophy size={16} className="text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-sm truncate">{a.title}</p>
                    <p className="text-muted text-xs">{a.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Certifications</h2>
            <Link href="/certificates" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
              See all <ArrowRight size={12} />
            </Link>
          </div>
          {certs.length === 0 ? (
            <EmptyState message="No certificates yet." />
          ) : (
            <div className="space-y-3">
              {certs.map(c => (
                <div key={c._id} className="bg-card border border-border rounded-xl p-4 flex gap-3 hover:border-green/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
                    <Award size={16} className="text-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-sm truncate">{c.title}</p>
                    <p className="text-muted text-xs">{c.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Testimonials preview — renders only if data exists */}
      <TestimonialsPreview />
    </div>
  );
}

function TestimonialsPreview() {
  const [items, setItems] = useState<import("@/types").Testimonial[]>([]);
  useEffect(() => {
    fetch("/api/testimonials")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setItems(d.slice(0, 2)); })
      .catch(() => {});
  }, []);
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text">Testimonials</h2>
        <Link href="/testimonials" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
          See all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t._id} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-green/30 transition-colors">
            <p className="text-text text-sm leading-relaxed flex-1">
              <span className="text-green text-xl font-black mr-1">&ldquo;</span>
              {t.quote}
              <span className="text-green text-xl font-black ml-1">&rdquo;</span>
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              {t.avatarUrl
                ? <img src={t.avatarUrl} alt={t.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center font-black text-green text-xs flex-shrink-0">{t.name.charAt(0)}</div>
              }
              <div className="min-w-0">
                <p className="font-semibold text-text text-sm">{t.name}</p>
                {(t.role || t.organization) && (
                  <p className="text-dim text-xs truncate">{t.role}{t.role && t.organization ? " · " : ""}{t.organization}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, onPlay }: { project: Project; onPlay?: (p: Project) => void }) {
  return (
    <Link href={`/projects/${p.slug}`} onClick={() => onPlay?.(p)}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-green/30 hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
        {p.banner ? (
          <img src={p.banner} alt={p.title} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-green/10 to-transparent flex items-center justify-center">
            <span className="font-mono text-2xl text-green/30">{"{}"}</span>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-text text-sm group-hover:text-green transition-colors">{p.title}</h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[p.status]}`}>
              {p.status}
            </span>
          </div>
          {p.description && <p className="text-muted text-xs line-clamp-2 mb-3">{p.description}</p>}
          <div className="flex flex-wrap gap-1">
            {p.techStack.slice(0, 3).map(t => (
              <span key={t} className="font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded">{t}</span>
            ))}
            {p.techStack.length > 3 && (
              <span className="font-mono text-[10px] text-dim">+{p.techStack.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
      <p className="text-dim text-sm">{message}</p>
    </div>
  );
}

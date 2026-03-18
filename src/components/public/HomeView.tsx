"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project, Achievement, Certificate, Skill } from "@/types";
import { Trophy, Award, ArrowRight, Cpu, TrendingUp, Star, Eye, Play, Zap, GitFork } from "lucide-react";
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
  "ai-ml":       "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "full-stack":  "text-green bg-green/10 border-green/20",
  "systems":     "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "power":       "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "competitive": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "tools":       "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "other":       "text-muted bg-surface border-border",
};

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    if (target > 0) {
      let start = 0;
      const step = target / (duration / 16);
      id = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(Math.floor(start));
        if (start >= target) clearInterval(id);
      }, 16);
    }
    return () => { if (id !== undefined) clearInterval(id); };
  }, [target, duration]);
  return count;
}

function StatBadge({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ElementType; color: string }) {
  const count = useCountUp(value);
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 bg-card border border-border rounded-xl ${color}`}>
      <Icon size={15} />
      <div>
        <p className="font-black text-lg stat-num leading-none">{count}</p>
        <p className="text-[10px] font-mono text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function HomeView() {
  const [projects,     setProjects]     = useState<Project[]>([]);
  const { setProject } = usePlayer();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certs,        setCerts]        = useState<Certificate[]>([]);
  const [skills,       setSkills]       = useState<Skill[]>([]);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => {
    fetch("/api/projects?featured=true").then(r => r.json()).then(d => Array.isArray(d) && setProjects(d.slice(0, 6)));
    fetch("/api/achievements").then(r => r.json()).then(d => Array.isArray(d) && setAchievements(d.slice(0, 4)));
    fetch("/api/certificates").then(r => r.json()).then(d => Array.isArray(d) && setCerts(d.slice(0, 4)));
    fetch("/api/skills").then(r => r.json()).then(d => Array.isArray(d) && setSkills(d.slice(0, 16)));
    setTimeout(() => setMounted(true), 60);
  }, []);

  return (
    <div className="space-y-10">
      {/* ── Greeting ── */}
      <div className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green animate-ping-slow" />
          <span className="text-green font-mono text-[11px] tracking-wider">AVAILABLE FOR WORK</span>
        </div>
        <h1 className="text-4xl font-black text-text">{greeting()}, Vipin.</h1>
        <p className="text-muted text-sm mt-1">Welcome to your engineering identity platform.</p>
      </div>

      {/* ── Quick-stats strip ── */}
      {(projects.length + skills.length + achievements.length) > 0 && (
        <div className={`flex flex-wrap gap-3 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          {projects.length > 0     && <StatBadge value={projects.length}     label="Projects"     icon={Zap}    color="text-green" />}
          {skills.length > 0       && <StatBadge value={skills.length}       label="Skills"       icon={Cpu}    color="text-purple-400" />}
          {achievements.length > 0 && <StatBadge value={achievements.length} label="Achievements" icon={Trophy} color="text-yellow-400" />}
          {certs.length > 0        && <StatBadge value={certs.length}        label="Certificates" icon={Award}  color="text-blue-400" />}
        </div>
      )}

      {/* ── Featured Projects ── */}
      <section className={`transition-all duration-500 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
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
            {projects.map((p, i) => <ProjectCard key={p._id} project={p} onPlay={setProject} index={i} />)}
          </div>
        )}
      </section>

      {/* ── Skills strip ── */}
      {skills.length > 0 && (
        <section className={`transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
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
                  className={`tech-badge flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${colorClass}`}
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
              <Link href="/skills" className="tech-badge px-3 py-1.5 rounded-full text-xs font-mono text-dim bg-card border border-border hover:border-green/30 hover:text-green transition-colors">
                + more →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Achievements + Certs ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-500 delay-[250ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
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
                <div key={a._id} className="card-hover bg-card border border-border rounded-xl p-4 flex gap-3 hover:border-yellow-500/30">
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
                <div key={c._id} className="card-hover bg-card border border-border rounded-xl p-4 flex gap-3 hover:border-green/30">
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

      {/* ── Testimonials preview ── */}
      <TestimonialsPreview />

      {/* ── Top Charts ── */}
      {projects.length > 0 && (
        <section className={`transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green" />
              <h2 className="text-xl font-bold text-text">Top Charts</h2>
            </div>
            <Link href="/projects" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
              See all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {[...projects]
              .sort((a, b) => ((b.views || 0) + (b.githubStars || 0) * 3) - ((a.views || 0) + (a.githubStars || 0) * 3))
              .slice(0, 5)
              .map((p, i) => (
                <Link key={p._id} href={`/projects/${p.slug}`} onClick={() => setProject(p)}>
                  <div className="flex items-center gap-4 px-5 py-3 hover:bg-surface transition-colors border-b border-border last:border-0 group">
                    <span className={`font-black text-sm w-5 text-right flex-shrink-0 ${i === 0 ? "text-green" : "text-dim"}`}>{i + 1}</span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface border border-border">
                      {p.banner
                        ? <img src={p.banner} alt={p.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center font-mono text-dim text-xs">{"{}"}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text text-sm truncate group-hover:text-green transition-colors">{p.title}</p>
                      <p className="text-dim text-xs font-mono">{p.techStack.slice(0, 2).join(" · ")}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-dim text-[11px] font-mono">
                      {(p.githubStars || 0) > 0 && (
                        <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" />{p.githubStars}</span>
                      )}
                      {(p.githubForks || 0) > 0 && (
                        <span className="flex items-center gap-1"><GitFork size={10} />{p.githubForks}</span>
                      )}
                      {(p.views || 0) > 0 && (
                        <span className="flex items-center gap-1"><Eye size={10} />{p.views}</span>
                      )}
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green hover:border-green hover:text-bg">
                        <Play size={11} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
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
          <div key={t._id} className="card-hover bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-green/30">
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

function ProjectCard({ project: p, onPlay, index }: { project: Project; onPlay?: (p: Project) => void; index: number }) {
  return (
    <div
      className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer card-hover hover:border-green/35"
      style={{
        animation: `slideUp 0.4s ease both`,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Link href={`/projects/${p.slug}`} onClick={() => onPlay?.(p)}>
        {/* Banner */}
        {p.banner ? (
          <img src={p.banner} alt={p.title}
            className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-green/8 to-transparent flex items-center justify-center relative overflow-hidden">
            <span className="font-mono text-3xl text-green/15 select-none">{"{}"}</span>
            <div className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: "linear-gradient(#1ED760 1px, transparent 1px), linear-gradient(90deg, #1ED760 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />
          </div>
        )}

        {/* Status badge */}
        <span className={`absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>
          {p.status}
        </span>
        {p.pinned && (
          <span className="absolute top-2 left-2 bg-green text-bg text-[10px] font-bold px-2 py-0.5 rounded-full">
            Pinned
          </span>
        )}

        <div className="p-4">
          <h3 className="font-bold text-text text-sm group-hover:text-green transition-colors mb-1.5 leading-snug">{p.title}</h3>
          {p.description && <p className="text-muted text-xs line-clamp-2 mb-3 leading-relaxed">{p.description}</p>}

          {/* Tech stack badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {p.techStack.slice(0, 3).map(t => (
              <span key={t} className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-green/30 hover:text-green">{t}</span>
            ))}
            {p.techStack.length > 3 && (
              <span className="font-mono text-[10px] text-dim">+{p.techStack.length - 3}</span>
            )}
          </div>

          {/* Stats */}
          {(p.githubStars > 0 || p.githubForks > 0) && (
            <div className="flex items-center gap-3 text-[10px] font-mono text-dim border-t border-border/40 pt-2.5">
              {p.githubStars > 0 && (
                <span className="flex items-center gap-1"><Star size={9} className="text-yellow-400" />{p.githubStars}</span>
              )}
              {p.githubForks > 0 && (
                <span className="flex items-center gap-1"><GitFork size={9} />{p.githubForks}</span>
              )}
              {p.githubLanguage && (
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
                  {p.githubLanguage}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
      <p className="text-dim text-sm">{message}</p>
    </div>
  );
}

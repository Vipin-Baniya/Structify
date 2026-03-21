"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Project, Achievement, Certificate, Skill } from "@/types";
import {
  Trophy, Award, ArrowRight, Cpu, TrendingUp, Star, Eye, Play,
  Zap, GitFork, ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";
import { usePlayer } from "@/components/ui/PlayerContext";

/* ─── Motion helpers ─────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
});

/* ─── Constants ──────────────────────────────────────────────────────── */
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

const ROLES = ["Engineer.", "Builder.", "Problem Solver."];

/* ─── Typing animation ───────────────────────────────────────────────── */
function TypingRole() {
  const [roleIdx,   setRoleIdx]   = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    const target = ROLES[roleIdx];
    let t: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (displayed.length < target.length) {
        t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80);
      } else {
        t = setTimeout(() => setDeleting(true), 2400);
      }
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
      } else {
        setDeleting(false);
        setRoleIdx(i => (i + 1) % ROLES.length);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, roleIdx]);

  return (
    <span>
      <span className="text-green">{displayed}</span>
      <span className="typing-cursor" />
    </span>
  );
}

/* ─── Count-up hook ──────────────────────────────────────────────────── */
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

/* ─── Stat badge ─────────────────────────────────────────────────────── */
function StatBadge({
  value, label, icon: Icon, color,
}: { value: number; label: string; icon: React.ElementType; color: string }) {
  const count = useCountUp(value);
  return (
    <motion.div
      className={`flex items-center gap-2.5 px-4 py-3 bg-card border border-border rounded-xl ${color}`}
      whileHover={{ y: -2, borderColor: "rgba(29,185,84,0.4)", transition: { duration: 0.15 } }}
    >
      <Icon size={15} />
      <div>
        <p className="font-black text-lg stat-num leading-none">{count}</p>
        <p className="text-[10px] font-mono text-muted mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── Netflix horizontal row ─────────────────────────────────────────── */
function HorizontalRow({
  title, projects, onPlay,
}: { title: string; projects: Project[]; onPlay: (p: Project) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }, []);

  if (projects.length === 0) return null;

  return (
    <div className="relative group/row">
      {/* Row header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <ArrowRight size={14} className="text-green opacity-0 group-hover/row:opacity-100 transition-opacity" />
        </div>
        <Link href="/projects" className="text-xs text-muted hover:text-green font-mono flex items-center gap-1 transition-colors">
          See all <ArrowRight size={12} />
        </Link>
      </div>

      {/* Scroll arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border text-muted
                   hover:text-text hover:bg-surface hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100
                   transition-all -translate-x-4 shadow-lg"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border text-muted
                   hover:text-text hover:bg-surface hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100
                   transition-all translate-x-4 shadow-lg"
      >
        <ChevronRight size={14} />
      </button>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {projects.map((p, i) => (
          <ProjectCard key={p._id} project={p} onPlay={onPlay} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Project card (Netflix tile) ────────────────────────────────────── */
function ProjectCard({
  project: p, onPlay, index,
}: { project: Project; onPlay?: (p: Project) => void; index: number }) {
  return (
    <motion.div
      className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 w-64"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      whileHover={{
        y: -6,
        borderColor: "rgba(29,185,84,0.5)",
        boxShadow: "0 20px 60px rgba(29,185,84,0.15)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.97 }}
    >
      <Link href={`/projects/${p.slug}`} onClick={() => onPlay?.(p)}>
        {/* Banner */}
        {p.banner ? (
          <img
            src={p.banner}
            alt={p.title}
            className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-green/8 to-transparent flex items-center justify-center relative overflow-hidden">
            <span className="font-mono text-3xl text-green/15 select-none">{"{}"}</span>
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: "linear-gradient(#1DB954 1px, transparent 1px), linear-gradient(90deg, #1DB954 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>
        )}

        {/* Overlay play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-bg/30">
          <div className="w-10 h-10 rounded-full bg-green flex items-center justify-center shadow-lg shadow-green/30">
            <Play size={14} fill="currentColor" className="text-bg ml-0.5" />
          </div>
        </div>

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
          <h3 className="font-bold text-text text-sm group-hover:text-green transition-colors mb-1.5 leading-snug truncate">
            {p.title}
          </h3>
          {p.description && (
            <p className="text-muted text-xs line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
          )}

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1 mb-3">
            {p.techStack.slice(0, 3).map(t => (
              <span key={t} className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-green/30 hover:text-green">
                {t}
              </span>
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
    </motion.div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────── */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
      <p className="text-dim text-sm">{message}</p>
    </div>
  );
}

/* ─── Live stat card ─────────────────────────────────────────────────── */
function LiveStatCard({
  label, value, suffix, color, icon,
}: { label: string; value: number; suffix: string; color: string; icon: string }) {
  const count = useCountUp(value);
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-4 transition-colors group"
      whileHover={{ y: -3, borderColor: "rgba(29,185,84,0.3)", boxShadow: "0 12px 40px rgba(29,185,84,0.08)", transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-lg ${color}`}>{icon}</span>
        <span className="font-mono text-[8px] text-dim uppercase tracking-widest">live</span>
      </div>
      <p className={`font-black text-2xl leading-none ${color}`}>
        {count}{suffix}
      </p>
      <p className="font-mono text-[10px] text-muted mt-1">{label}</p>
    </motion.div>
  );
}

/* ─── Testimonials preview ───────────────────────────────────────────── */
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
          <motion.div
            key={t._id}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
            whileHover={{ y: -3, borderColor: "rgba(29,185,84,0.3)", boxShadow: "0 12px 40px rgba(29,185,84,0.10)", transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
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
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main view ──────────────────────────────────────────────────────── */
export default function HomeView() {
  const [projects,     setProjects]     = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certs,        setCerts]        = useState<Certificate[]>([]);
  const [skills,       setSkills]       = useState<Skill[]>([]);
  const [profile,      setProfile]      = useState<{ resumeUrl?: string } | null>(null);
  const [mounted,      setMounted]      = useState(false);
  const { setProject } = usePlayer();

  useEffect(() => {
    fetch("/api/projects?featured=true").then(r => r.json()).then(d => Array.isArray(d) && setProjects(d.slice(0, 12)));
    fetch("/api/achievements").then(r => r.json()).then(d => Array.isArray(d) && setAchievements(d.slice(0, 4)));
    fetch("/api/certificates").then(r => r.json()).then(d => Array.isArray(d) && setCerts(d.slice(0, 4)));
    fetch("/api/skills").then(r => r.json()).then(d => Array.isArray(d) && setSkills(d.slice(0, 16)));
    fetch("/api/profile").then(r => r.json()).then(d => d && setProfile(d)).catch(() => {});
    setTimeout(() => setMounted(true), 60);
  }, []);

  /* Build Netflix-style rows ------------------------------------------ */
  const featured = projects.filter(p => p.featured || p.pinned);
  const active   = projects.filter(p => p.status === "active");
  const rest     = projects.filter(p => !p.featured && !p.pinned && p.status !== "active");

  return (
    <div className="space-y-12">

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO                                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className={`relative transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
        {/* Glow orbs */}
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-green/5 blur-3xl pointer-events-none animate-float" />
        <div className="absolute -top-8 right-0 w-60 h-60 rounded-full bg-green/[0.03] blur-3xl pointer-events-none animate-float" style={{ animationDelay: "3s" }} />

        {/* Status badge */}
        <motion.div {...fadeUp(0)} className="mb-5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
          </span>
          <span className="text-green font-mono text-[11px] tracking-wider uppercase">Available for Work</span>
        </motion.div>

        {/* Name */}
        <motion.h1 {...fadeUp(0.05)} className="font-display text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-3">
          <span
            className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
            style={{ textShadow: "0 0 80px rgba(29,185,84,0.15)" }}
          >
            Vipin Baniya
          </span>
        </motion.h1>

        {/* Typing role */}
        <motion.p {...fadeUp(0.12)} className="font-display text-2xl md:text-3xl font-bold text-muted mb-6">
          <TypingRole />
        </motion.p>

        {/* Personality copy */}
        <motion.div {...fadeUp(0.2)} className="max-w-xl space-y-1 mb-8">
          <p className="text-muted text-base leading-relaxed">
            Hey stranger&nbsp;👋&nbsp; Didn&apos;t expect you here&hellip;
          </p>
          <p className="text-muted text-base leading-relaxed">
            But now that you are — <span className="text-text font-semibold">let&apos;s make this worth your time.</span>
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.28)} className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="glow-on-hover inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green text-bg font-bold text-sm
                       hover:bg-green/90 transition-all shadow-lg shadow-green/20 hover:shadow-green/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap size={15} />
            Explore Projects
          </Link>
          {profile?.resumeUrl ? (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-text font-semibold text-sm
                         hover:border-green/40 hover:bg-white/[0.06] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink size={14} />
              Resume
            </a>
          ) : (
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-text font-semibold text-sm
                         hover:border-green/40 hover:bg-white/[0.06] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink size={14} />
              About Me
            </Link>
          )}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* QUICK STATS                                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {(projects.length + skills.length + achievements.length) > 0 && (
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {projects.length > 0     && <StatBadge value={projects.length}     label="Projects"     icon={Zap}    color="text-green" />}
          {skills.length > 0       && <StatBadge value={skills.length}       label="Skills"       icon={Cpu}    color="text-purple-400" />}
          {achievements.length > 0 && <StatBadge value={achievements.length} label="Achievements" icon={Trophy} color="text-yellow-400" />}
          {certs.length > 0        && <StatBadge value={certs.length}        label="Certificates" icon={Award}  color="text-blue-400" />}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* NETFLIX PROJECT ROWS                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.42 }}
        className="space-y-10"
      >
        {projects.length === 0 ? (
          <EmptyState message="No projects yet. Add one in the admin panel." />
        ) : (
          <>
            {featured.length > 0 && (
              <HorizontalRow title="⭐ Featured Projects" projects={featured} onPlay={setProject} />
            )}
            {active.length > 0 && (
              <HorizontalRow title="🔥 Currently Active" projects={active} onPlay={setProject} />
            )}
            {rest.length > 0 && (
              <HorizontalRow title="📁 More Projects" projects={rest} onPlay={setProject} />
            )}
            {/* Fallback when no featured/active split exists */}
            {featured.length === 0 && active.length === 0 && (
              <HorizontalRow title="🚀 All Projects" projects={projects} onPlay={setProject} />
            )}
          </>
        )}
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* LIVE DASHBOARD                                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="mb-4">
          <span className="font-mono text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-green to-green/50">
            {"// LIVE · DASHBOARD"}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <LiveStatCard label="LeetCode"      value={300}              suffix="+" color="text-yellow-400" icon="♥" />
          <LiveStatCard label="GFG Score"     value={1200}             suffix="+" color="text-green"      icon="⚡" />
          <LiveStatCard label="GitHub Commits" value={500}             suffix="+" color="text-blue-400"   icon="○" />
          <LiveStatCard label="Projects Built" value={projects.length} suffix=""  color="text-purple-400" icon="▦" />
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TECH STACK                                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {skills.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
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
        </motion.section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACHIEVEMENTS + CERTS                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
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
                <motion.div
                  key={a._id}
                  className="bg-card border border-border rounded-xl p-4 flex gap-3"
                  whileHover={{ y: -2, borderColor: "rgba(234,179,8,0.3)", boxShadow: "0 8px 30px rgba(234,179,8,0.08)", transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <Trophy size={16} className="text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-sm truncate">{a.title}</p>
                    <p className="text-muted text-xs">{a.organization}</p>
                  </div>
                </motion.div>
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
                <motion.div
                  key={c._id}
                  className="bg-card border border-border rounded-xl p-4 flex gap-3"
                  whileHover={{ y: -2, borderColor: "rgba(29,185,84,0.3)", boxShadow: "0 8px 30px rgba(29,185,84,0.08)", transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
                    <Award size={16} className="text-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-sm truncate">{c.title}</p>
                    <p className="text-muted text-xs">{c.issuer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <TestimonialsPreview />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TOP CHARTS                                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {projects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
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
                  <motion.div
                    className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 group"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)", transition: { duration: 0.15 } }}
                  >
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
                  </motion.div>
                </Link>
              ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

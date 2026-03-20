"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Folder, Trophy, Award, Briefcase, Cpu, User, Mail,
  BookOpen, Quote, Compass, Sparkles, ArrowRight, Play,
  Star, GitFork, Eye, Zap,
} from "lucide-react";
import { Project, Achievement, Skill } from "@/types";
import { usePlayer } from "@/components/ui/PlayerContext";

/* ─── Glassmorphism card styles ────────────────────────────────── */
const GLASS_BASE =
  "backdrop-blur-xl bg-white/[0.05] border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

/* ─── Category cards — each with its own gradient + icon ─────── */
const CATEGORIES = [
  {
    href: "/projects",
    label: "Projects",
    icon: Folder,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    glow: "shadow-violet-500/30",
    desc: "Engineered systems & open-source",
  },
  {
    href: "/skills",
    label: "Tech Stack",
    icon: Cpu,
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    glow: "shadow-cyan-500/30",
    desc: "Languages, tools & frameworks",
  },
  {
    href: "/achievements",
    label: "Achievements",
    icon: Trophy,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-amber-500/30",
    desc: "Hackathons, awards & wins",
  },
  {
    href: "/certificates",
    label: "Certificates",
    icon: Award,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glow: "shadow-emerald-500/30",
    desc: "Verified courses & credentials",
  },
  {
    href: "/experience",
    label: "Experience",
    icon: Briefcase,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    glow: "shadow-pink-500/30",
    desc: "Internships & professional roles",
  },
  {
    href: "/blog",
    label: "Notes",
    icon: BookOpen,
    gradient: "from-indigo-500 via-blue-500 to-violet-600",
    glow: "shadow-indigo-500/30",
    desc: "Engineering blogs & writeups",
  },
  {
    href: "/testimonials",
    label: "Testimonials",
    icon: Quote,
    gradient: "from-fuchsia-500 via-pink-500 to-rose-400",
    glow: "shadow-fuchsia-500/30",
    desc: "Words from collaborators",
  },
  {
    href: "/about",
    label: "About",
    icon: User,
    gradient: "from-lime-500 via-green-500 to-teal-500",
    glow: "shadow-lime-500/30",
    desc: "Philosophy & background",
  },
  {
    href: "/contact",
    label: "Contact",
    icon: Mail,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    glow: "shadow-sky-500/30",
    desc: "Let's build something great",
  },
];

/* ─── Helpers ─────────────────────────────────────────────────── */
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
});

const STATUS_BADGE: Record<string, string> = {
  active:    "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  completed: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  research:  "bg-pink-500/20 text-pink-300 border border-pink-500/30",
};

/* ─── Sub-components ──────────────────────────────────────────── */
function CategoryCard({
  href, label, icon: Icon, gradient, glow, desc, index,
}: (typeof CATEGORIES)[0] & { index: number }) {
  return (
    <motion.div {...fadeUp(0.05 * index)}>
      <Link href={href}>
        <div
          className={`group relative overflow-hidden rounded-2xl p-5 h-36
            bg-gradient-to-br ${gradient}
            shadow-lg ${glow}
            transition-all duration-300
            hover:scale-[1.04] hover:shadow-2xl cursor-pointer`}
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay rounded-2xl"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Icon */}
          <div className="relative z-10 w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
            <Icon size={20} className="text-white drop-shadow-sm" />
          </div>

          {/* Label */}
          <p className="relative z-10 font-bold text-white text-base leading-tight mb-0.5 drop-shadow-sm">
            {label}
          </p>
          <p className="relative z-10 text-white/75 text-[11px] font-medium truncate drop-shadow-sm">
            {desc}
          </p>

          {/* Arrow on hover */}
          <ArrowRight
            size={14}
            className="absolute bottom-4 right-4 text-white/0 group-hover:text-white/80 transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-10"
          />
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedProjectCard({
  project: p,
  onPlay,
  index,
}: {
  project: Project;
  onPlay?: (p: Project) => void;
  index: number;
}) {
  return (
    <motion.div {...fadeUp(0.06 * index)}>
      <Link href={`/projects/${p.slug}`} onClick={() => onPlay?.(p)}>
        <div
          className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
            hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10
            ${GLASS_BASE}`}
        >
          {/* Banner */}
          {p.banner ? (
            <img
              src={p.banner}
              alt={p.title}
              className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-fuchsia-900/20 flex items-center justify-center relative overflow-hidden">
              <span className="font-mono text-4xl text-violet-300/20 select-none">{"{}"}</span>
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          )}

          {/* Status badge */}
          <span
            className={`absolute top-2.5 right-2.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full backdrop-blur-sm
              ${STATUS_BADGE[p.status] ?? ""}`}
          >
            {p.status}
          </span>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/50 translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
              <Play size={18} fill="white" className="text-white ml-0.5" />
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors mb-1.5 leading-snug">
              {p.title}
            </h3>
            {p.description && (
              <p className="text-white/50 text-xs line-clamp-2 mb-3 leading-relaxed">
                {p.description}
              </p>
            )}

            {/* Tech stack */}
            <div className="flex flex-wrap gap-1 mb-3">
              {p.techStack.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="font-mono text-[10px] bg-white/[0.06] text-white/50 px-2 py-0.5 rounded border border-white/[0.08] group-hover:border-violet-400/30 group-hover:text-violet-300/70 transition-colors"
                >
                  {t}
                </span>
              ))}
              {p.techStack.length > 3 && (
                <span className="font-mono text-[10px] text-white/30">
                  +{p.techStack.length - 3}
                </span>
              )}
            </div>

            {/* Stats */}
            {(p.githubStars > 0 || p.githubForks > 0) && (
              <div className="flex items-center gap-3 text-[10px] font-mono text-white/30 border-t border-white/[0.06] pt-2.5">
                {p.githubStars > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={9} className="text-amber-400" />
                    {p.githubStars}
                  </span>
                )}
                {p.githubForks > 0 && (
                  <span className="flex items-center gap-1">
                    <GitFork size={9} />
                    {p.githubForks}
                  </span>
                )}
                {(p.views || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye size={9} />
                    {p.views}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TopPickRow({
  project: p,
  rank,
  onPlay,
}: {
  project: Project;
  rank: number;
  onPlay?: (p: Project) => void;
}) {
  return (
    <Link href={`/projects/${p.slug}`} onClick={() => onPlay?.(p)}>
      <div
        className={`group flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200
          hover:bg-white/[0.06] hover:backdrop-blur-sm cursor-pointer`}
      >
        <span
          className={`font-black text-sm w-5 text-right flex-shrink-0 ${
            rank === 1 ? "text-violet-400" : "text-white/30"
          }`}
        >
          {rank}
        </span>
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05] border border-white/[0.08]">
          {p.banner ? (
            <img src={p.banner} alt={p.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-white/20 text-xs">
              {"{}"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate group-hover:text-violet-300 transition-colors">
            {p.title}
          </p>
          <p className="text-white/30 text-xs font-mono">
            {p.techStack.slice(0, 2).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-white/25 text-[11px] font-mono">
          {(p.githubStars || 0) > 0 && (
            <span className="flex items-center gap-1">
              <Star size={10} className="text-amber-400" />
              {p.githubStars}
            </span>
          )}
          {(p.views || 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {p.views}
            </span>
          )}
          <div className="w-7 h-7 rounded-full border border-white/[0.10] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-500 hover:border-violet-500">
            <Play size={10} fill="currentColor" className="text-white ml-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function AchievementPill({ a }: { a: Achievement }) {
  const TYPE_COLORS: Record<string, string> = {
    hackathon:   "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300",
    award:       "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300",
    internship:  "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300",
    competition: "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-300",
    research:    "from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-300",
    other:       "from-white/10 to-white/5 border-white/15 text-white/60",
  };
  const cls = TYPE_COLORS[a.type] ?? TYPE_COLORS.other;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-gradient-to-r ${cls}
        backdrop-blur-sm transition-all duration-200 hover:scale-[1.01]`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <Trophy size={14} className="text-current" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-current text-sm truncate">{a.title}</p>
        {a.organization && <p className="text-current/60 text-xs">{a.organization}</p>}
      </div>
      <span className="font-mono text-[10px] capitalize ml-auto opacity-70">{a.type}</span>
    </div>
  );
}

function SkillBubble({ s, index }: { s: Skill; index: number }) {
  const COLORS: Record<string, string> = {
    "ai-ml":       "from-violet-500/20 to-purple-600/10 border-violet-400/30 text-violet-300",
    "full-stack":  "from-emerald-500/20 to-teal-600/10 border-emerald-400/30 text-emerald-300",
    "systems":     "from-orange-500/20 to-amber-600/10 border-orange-400/30 text-orange-300",
    "power":       "from-yellow-500/20 to-amber-500/10 border-yellow-400/30 text-yellow-300",
    "competitive": "from-sky-500/20 to-blue-600/10 border-sky-400/30 text-sky-300",
    "tools":       "from-cyan-500/20 to-teal-600/10 border-cyan-400/30 text-cyan-300",
    "other":       "from-white/10 to-white/5 border-white/15 text-white/50",
  };
  const cls = COLORS[s.category] ?? COLORS.other;
  return (
    <motion.div {...fadeUp(0.02 * index)}>
      <Link href="/skills">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border
            bg-gradient-to-r ${cls} backdrop-blur-sm
            transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}
        >
          {s.iconUrl ? (
            <img src={s.iconUrl} alt={s.name} className="w-3.5 h-3.5 object-contain" />
          ) : (
            <Cpu size={10} />
          )}
          {s.name}
        </span>
      </Link>
    </motion.div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────── */
export default function ExploreView() {
  const [projects,     setProjects]     = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [skills,       setSkills]       = useState<Skill[]>([]);
  const { setProject } = usePlayer();

  useEffect(() => {
    fetch("/api/projects?featured=true")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProjects(d.slice(0, 6)));
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setAchievements(d.slice(0, 6)));
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSkills(d.slice(0, 20)));
  }, []);

  const topProjects = [...projects]
    .sort(
      (a, b) =>
        (b.views || 0) + (b.githubStars || 0) * 3 -
        ((a.views || 0) + (a.githubStars || 0) * 3),
    )
    .slice(0, 5);

  return (
    <div className="space-y-12 relative">
      {/* ── Ambient background orbs ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px] animate-float" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-fuchsia-600/6 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[100px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── Header greeting ─────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Compass size={18} className="text-white" />
          </div>
          <div>
            <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest">
              {timeGreeting()}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              Explore
            </h1>
          </div>
        </div>
        <p className="text-white/40 text-sm ml-12">
          Dive into Vipin&apos;s engineering universe — projects, skills & more.
        </p>
      </motion.div>

      {/* ── Quick-action chips ───────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-2">
        {[
          { href: "/projects", label: "🚀 Projects", color: "from-violet-500/20 to-purple-500/10 border-violet-400/40 text-violet-300" },
          { href: "/skills",   label: "⚡ Skills",   color: "from-cyan-500/20 to-sky-500/10 border-cyan-400/40 text-cyan-300" },
          { href: "/blog",     label: "📝 Notes",    color: "from-indigo-500/20 to-blue-500/10 border-indigo-400/40 text-indigo-300" },
          { href: "/about",    label: "👤 About",    color: "from-emerald-500/20 to-teal-500/10 border-emerald-400/40 text-emerald-300" },
          { href: "/contact",  label: "✉️ Contact",  color: "from-pink-500/20 to-rose-500/10 border-pink-400/40 text-pink-300" },
        ].map(({ href, label, color }) => (
          <Link key={href} href={href}>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border
                bg-gradient-to-r ${color} backdrop-blur-sm
                transition-all duration-200 hover:scale-105 cursor-pointer`}
            >
              {label}
            </span>
          </Link>
        ))}
      </motion.div>

      {/* ── Browse All — category grid ───────────────────────────── */}
      <motion.section {...fadeUp(0.08)}>
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} className="text-violet-400" />
          <h2 className="text-xl font-bold text-white">Browse All</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.href} {...cat} index={i} />
          ))}
        </div>
      </motion.section>

      {/* ── Featured projects + Top charts side-by-side ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Featured Projects */}
        <motion.section {...fadeUp(0.10)}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-violet-400" />
              <h2 className="text-xl font-bold text-white">Featured Projects</h2>
            </div>
            <Link
              href="/projects"
              className="text-xs text-white/40 hover:text-violet-300 font-mono flex items-center gap-1 transition-colors"
            >
              See all <ArrowRight size={12} />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div
              className={`${GLASS_BASE} rounded-2xl p-10 text-center border-dashed`}
            >
              <p className="text-white/30 text-sm">No projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p, i) => (
                <FeaturedProjectCard
                  key={p._id}
                  project={p}
                  onPlay={setProject}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Top Charts */}
        {topProjects.length > 0 && (
          <motion.section {...fadeUp(0.12)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Top Charts</h2>
              <Link
                href="/projects"
                className="text-xs text-white/40 hover:text-violet-300 font-mono flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className={`${GLASS_BASE} rounded-2xl overflow-hidden py-2`}>
              {topProjects.map((p, i) => (
                <TopPickRow
                  key={p._id}
                  project={p}
                  rank={i + 1}
                  onPlay={setProject}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* ── Achievements ─────────────────────────────────────────── */}
      {achievements.length > 0 && (
        <motion.section {...fadeUp(0.14)}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <h2 className="text-xl font-bold text-white">Highlights & Wins</h2>
            </div>
            <Link
              href="/achievements"
              className="text-xs text-white/40 hover:text-violet-300 font-mono flex items-center gap-1 transition-colors"
            >
              See all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <AchievementPill key={a._id} a={a} />
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Tech Stack cloud ─────────────────────────────────────── */}
      {skills.length > 0 && (
        <motion.section {...fadeUp(0.16)}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Tech Ecosystem</h2>
            </div>
            <Link
              href="/skills"
              className="text-xs text-white/40 hover:text-violet-300 font-mono flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <SkillBubble key={s._id} s={s} index={i} />
            ))}
            {skills.length >= 20 && (
              <Link href="/skills">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-mono text-white/30 bg-white/[0.04] border border-white/[0.08] hover:border-violet-400/40 hover:text-violet-300 transition-colors cursor-pointer">
                  + more →
                </span>
              </Link>
            )}
          </div>
        </motion.section>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.18)}>
        <div
          className={`${GLASS_BASE} rounded-2xl p-8 text-center
            bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-fuchsia-900/10`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Mail size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Want to collaborate?</h3>
          <p className="text-white/40 text-sm mb-5 max-w-sm mx-auto">
            Open to interesting projects, research opportunities, and creative builds.
          </p>
          <Link href="/contact">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-200 cursor-pointer">
              Get in touch <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

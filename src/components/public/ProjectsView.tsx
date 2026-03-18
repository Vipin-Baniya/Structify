"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Project } from "@/types";
import { Search, Briefcase, Star, GitFork, Play, ExternalLink, Github, Shuffle, TrendingUp, Eye, Zap } from "lucide-react";
import { usePlayer } from "@/components/ui/PlayerContext";
import dynamic from "next/dynamic";

const RecruiterMode = dynamic(() => import("./RecruiterMode"), { ssr: false });

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green/20 text-green border-green/20",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  research:  "bg-purple-500/20 text-purple-400 border-purple-500/20",
};

const CARD_ACCENT: string[] = [
  "from-green/5",
  "from-blue-500/5",
  "from-purple-500/5",
  "from-orange-500/5",
  "from-pink-500/5",
  "from-cyan-500/5",
];

type SortMode = "default" | "trending" | "stars" | "views" | "shuffle";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ProjectsView() {
  const [projects,      setProjects]      = useState<Project[]>([]);
  const [query,         setQuery]         = useState("");
  const [filter,        setFilter]        = useState("all");
  const [sort,          setSort]          = useState<SortMode>("default");
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [mounted,       setMounted]       = useState(false);
  const [hoveredId,     setHoveredId]     = useState<string | null>(null);
  const { setProject } = usePlayer();
  const shuffleRef = useRef(false);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => Array.isArray(d) && setProjects(d));
    setTimeout(() => setMounted(true), 50);
  }, []);

  // Filtering
  const baseFiltered = projects.filter(p => {
    const matchQ = !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase()) ||
      p.techStack.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
      (p.topics || []).some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchF = filter === "all" || p.status === filter;
    return matchQ && matchF;
  });

  // Sorting
  const sorted = (() => {
    const arr = [...baseFiltered];
    if (sort === "stars")    return arr.sort((a, b) => (b.githubStars || 0) - (a.githubStars || 0));
    if (sort === "views")    return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sort === "trending") return arr.sort((a, b) => ((b.views || 0) + (b.githubStars || 0) * 5) - ((a.views || 0) + (a.githubStars || 0) * 5));
    if (sort === "shuffle")  return shuffleArray(arr);
    // default: pinned first, then order
    return arr.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (a.order || 0) - (b.order || 0);
    });
  })();

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-3xl font-black text-text">Projects</h1>
          <p className="text-muted text-sm mt-0.5">
            {projects.length} projects · {projects.filter(p => p.status === "active").length} active
          </p>
        </div>
        <button
          onClick={() => setRecruiterMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-mono text-muted hover:text-green hover:border-green/40 transition-all shrink-0 mt-1 group"
        >
          <Briefcase size={13} className="group-hover:scale-110 transition-transform" />
          Recruiter Mode
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, stack, topic..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text outline-none focus:border-green/40 transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          {(["all", "active", "completed", "research"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-mono capitalize transition-all
                ${filter === s ? "bg-green/20 text-green border border-green/30" : "bg-card border border-border text-muted hover:text-text"}`}>
              {s}
            </button>
          ))}

          {/* Sort */}
          <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
            {([
              { key: "default",  icon: null,        label: "Default" },
              { key: "trending", icon: TrendingUp,  label: "Trending" },
              { key: "stars",    icon: Star,        label: "Stars" },
              { key: "views",    icon: Eye,         label: "Views" },
              { key: "shuffle",  icon: Shuffle,     label: "Shuffle" },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button key={key}
                onClick={() => setSort(key)}
                title={label}
                className={`p-1.5 rounded-lg transition-all ${sort === key ? "bg-green/20 text-green" : "text-dim hover:text-text"}`}>
                {Icon ? <Icon size={13} /> : <Zap size={13} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      {sorted.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
          <p className="text-dim text-sm">
            {projects.length === 0 ? "No projects yet. Add one in the admin panel." : "No projects match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p, i) => {
            const accent = p.color ? "" : CARD_ACCENT[i % CARD_ACCENT.length];
            const isHovered = hoveredId === p._id;

            return (
              <div key={p._id}
                className={`group relative bg-card border border-border rounded-2xl overflow-hidden
                  transition-all duration-300 cursor-pointer
                  ${isHovered ? "border-green/40 shadow-lg shadow-green/5 -translate-y-1" : "hover:border-green/20"}
                  ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{
                  transitionDelay: mounted ? `${i * 40}ms` : "0ms",
                  ...(p.color ? { borderColor: `${p.color}30` } : {}),
                }}
                onMouseEnter={() => setHoveredId(p._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Banner / gradient */}
                <div className="relative">
                  {p.banner ? (
                    <img src={p.banner} alt={p.title}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className={`w-full h-40 bg-gradient-to-br ${accent} to-transparent flex items-center justify-center relative`}>
                      <span className="font-mono text-4xl text-white/5 select-none">{"{}"}</span>
                      {/* Animated grid */}
                      <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }} />
                    </div>
                  )}

                  {/* Pinned badge */}
                  {p.pinned && (
                    <span className="absolute top-2 left-2 bg-green text-bg text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Pinned
                    </span>
                  )}

                  {/* Status badge */}
                  <span className={`absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLOR[p.status]}`}>
                    {p.status}
                  </span>

                  {/* Hover overlay with quick actions */}
                  <div className={`absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center gap-3
                    transition-all duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                    <Link href={`/projects/${p.slug}`} onClick={() => setProject(p)}
                      className="w-10 h-10 rounded-full bg-green flex items-center justify-center text-bg hover:opacity-90 transition-opacity shadow-lg shadow-green/30">
                      <Play size={14} className="ml-0.5" fill="currentColor" />
                    </Link>
                    {(p.demoUrl || p.liveUrl) && (
                      <a href={p.demoUrl || p.liveUrl!} target="_blank" rel="noreferrer"
                        className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-green/40 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {p.githubOwner && p.githubRepo && (
                      <a href={`https://github.com/${p.githubOwner}/${p.githubRepo}`}
                        target="_blank" rel="noreferrer"
                        className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-green/40 transition-colors">
                        <Github size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <Link href={`/projects/${p.slug}`} onClick={() => setProject(p)}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-text text-sm group-hover:text-green transition-colors leading-snug">
                        {p.title}
                      </h3>
                    </div>

                    {p.description && (
                      <p className="text-muted text-xs line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                    )}

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.techStack.slice(0, 3).map(t => (
                        <span key={t} className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-green/30 hover:text-green">{t}</span>
                      ))}
                      {p.techStack.length > 3 && (
                        <span className="font-mono text-[10px] text-dim">+{p.techStack.length - 3}</span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-dim border-t border-border/50 pt-3">
                      {p.githubStars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={9} className="text-yellow-400" /> {p.githubStars}
                        </span>
                      )}
                      {p.githubForks > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork size={9} /> {p.githubForks}
                        </span>
                      )}
                      {p.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={9} /> {p.views}
                        </span>
                      )}
                      {p.githubLanguage && (
                        <span className="ml-auto flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
                          {p.githubLanguage}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {recruiterMode && <RecruiterMode onClose={() => setRecruiterMode(false)} />}
    </div>
  );
}

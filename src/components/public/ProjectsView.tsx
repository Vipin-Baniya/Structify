"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/types";
import { Search, Briefcase } from "lucide-react";
import { usePlayer } from "@/components/ui/PlayerContext";
import dynamic from "next/dynamic";
const RecruiterMode = dynamic(() => import("./RecruiterMode"), { ssr: false });

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green/20 text-green",
  completed: "bg-blue-500/20 text-blue-400",
  research:  "bg-purple-500/20 text-purple-400",
};

export default function ProjectsView() {
  const [projects,      setProjects]      = useState<Project[]>([]);
  const [query,         setQuery]         = useState("");
  const [filter,        setFilter]        = useState("all");
  const [recruiterMode, setRecruiterMode] = useState(false);
  const { setProject } = usePlayer();

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => Array.isArray(d) && setProjects(d));
  }, []);

  const filtered = projects.filter(p => {
    const matchQ = p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase()) ||
      p.techStack.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchF = filter === "all" || p.status === filter;
    return matchQ && matchF;
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-3xl font-black text-text">Projects</h1>
        <button
          onClick={() => setRecruiterMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-mono text-muted hover:text-green hover:border-green/40 transition-colors shrink-0 mt-1"
        >
          <Briefcase size={13} /> Recruiter Mode
        </button>
      </div>
      <p className="text-muted text-sm mb-6">Engineered systems, built with purpose.</p>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
          />
        </div>
        {["all", "active", "completed", "research"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-mono capitalize transition-colors
              ${filter === s ? "bg-green/20 text-green" : "bg-card border border-border text-muted hover:text-text"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">{projects.length === 0 ? "No projects yet. Add one in the admin panel." : "No projects match your search."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Link key={p._id} href={`/projects/${p.slug}`} onClick={() => setProject(p)}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-green/30 hover:scale-[1.02] transition-all duration-200 group h-full">
                {p.banner ? (
                  <img src={p.banner} alt={p.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-green/10 via-transparent to-transparent flex items-center justify-center">
                    <span className="font-mono text-3xl text-green/20">{"{}"}</span>
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
                    {p.techStack.slice(0, 4).map(t => (
                      <span key={t} className="font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>

      {/* Recruiter mode overlay */}
      {recruiterMode && <RecruiterMode onClose={() => setRecruiterMode(false)} />}
  );
}

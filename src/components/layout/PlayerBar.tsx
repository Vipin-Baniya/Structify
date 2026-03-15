"use client";
import Link from "next/link";
import { usePlayer } from "@/components/ui/PlayerContext";
import { Github, ExternalLink, X, Code2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green/20 text-green",
  completed: "bg-blue-500/20 text-blue-400",
  research:  "bg-purple-500/20 text-purple-400",
};

export default function PlayerBar() {
  const { project, setProject } = usePlayer();
  if (!project) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border
                    backdrop-blur-sm flex items-center gap-4 px-4 md:px-6 py-3 shadow-2xl">
      {/* Project thumbnail */}
      <div className="shrink-0">
        {project.banner ? (
          <img src={project.banner} alt={project.title} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center font-mono text-green/40 text-xs">
            {"{}"}
          </div>
        )}
      </div>

      {/* Project info */}
      <div className="flex-1 min-w-0">
        <Link href={`/projects/${project.slug}`}
          className="font-semibold text-text text-sm hover:text-green transition-colors truncate block">
          {project.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${STATUS_COLOR[project.status]}`}>
            {project.status}
          </span>
          {project.techStack.slice(0, 3).map(t => (
            <span key={t} className="font-mono text-[10px] text-dim">{t}</span>
          ))}
          {project.techStack.length > 3 && (
            <span className="font-mono text-[10px] text-dim">+{project.techStack.length - 3}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/projects/${project.slug}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green/10 border border-green/30 text-green rounded-lg text-xs font-mono hover:bg-green/20 transition-colors">
          <Code2 size={12} /> View
        </Link>
        {project.githubOwner && project.githubRepo && (
          <a href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
            target="_blank" rel="noreferrer"
            className="p-1.5 text-dim hover:text-text transition-colors rounded-lg hover:bg-white/5">
            <Github size={16} />
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer"
            className="p-1.5 text-dim hover:text-text transition-colors rounded-lg hover:bg-white/5">
            <ExternalLink size={16} />
          </a>
        )}
        <button onClick={() => setProject(null)}
          className="p-1.5 text-dim hover:text-text transition-colors rounded-lg hover:bg-white/5">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

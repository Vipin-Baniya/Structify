"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Project } from "@/types";
import { X, ChevronLeft, ChevronRight, Github, ExternalLink, Briefcase } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green/20 text-green",
  completed: "bg-blue-500/20 text-blue-400",
  research:  "bg-purple-500/20 text-purple-400",
};

interface RecruiterModeProps {
  onClose: () => void;
}

export default function RecruiterMode({ onClose }: RecruiterModeProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [step,     setStep]     = useState(0);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/projects?featured=true")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setProjects(d); })
      .finally(() => setLoading(false));
  }, []);

  const prev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => setStep(s => Math.min(projects.length - 1, s + 1)), [projects.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const project = projects[step];

  return (
    <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Briefcase size={16} className="text-green" />
          <span className="font-mono text-xs text-green">RECRUITER MODE</span>
          <span className="font-mono text-[10px] text-dim">— featured projects walkthrough</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-dim">
            {step + 1} / {projects.length} · ← → to navigate · Esc to exit
          </span>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-green transition-all duration-300"
          style={{ width: `${projects.length > 1 ? ((step + 1) / projects.length) * 100 : 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-3 w-full max-w-2xl px-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-dim text-sm mb-2">No featured projects yet.</p>
              <p className="text-dim text-xs">Mark projects as &ldquo;Featured&rdquo; in the admin panel.</p>
            </div>
          </div>
        ) : project ? (
          <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Banner */}
            {project.banner && (
              <img src={project.banner} alt={project.title}
                className="w-full h-56 object-cover rounded-2xl mb-8 border border-border" />
            )}

            {/* Step indicator dots */}
            <div className="flex justify-center gap-2 mb-8">
              {projects.map((_, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${i === step ? "bg-green w-5" : "bg-border hover:bg-muted"}`}
                />
              ))}
            </div>

            {/* Project content */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_COLOR[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <h1 className="text-4xl font-black text-text mb-3">{project.title}</h1>
              {project.description && (
                <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">{project.description}</p>
              )}
            </div>

            {/* Tech stack */}
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {project.techStack.map(t => (
                  <span key={t} className="font-mono text-xs bg-card border border-border text-muted px-3 py-1.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Long description */}
            {project.longDescription && (
              <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
                <p className="font-mono text-[10px] text-muted mb-3">// ABOUT THIS PROJECT</p>
                <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{project.longDescription}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href={`/projects/${project.slug}`} onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-green text-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                View Full Project
              </Link>
              {project.githubOwner && project.githubRepo && (
                <a href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-text rounded-xl text-sm hover:border-green/40 transition-colors">
                  <Github size={14} /> GitHub
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-text rounded-xl text-sm hover:border-green/40 transition-colors">
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer navigation */}
      {projects.length > 1 && (
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <button onClick={prev} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted hover:text-text disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>

          <div className="flex items-center gap-2">
            {projects.map((p, i) => (
              <button key={p._id} onClick={() => setStep(i)}
                className={`font-mono text-[10px] px-2 py-1 rounded transition-colors ${i === step ? "text-green" : "text-dim hover:text-muted"}`}>
                {i + 1}
              </button>
            ))}
          </div>

          {step < projects.length - 1 ? (
            <button onClick={next}
              className="flex items-center gap-2 px-4 py-2 bg-green text-bg rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-green/40 text-green rounded-lg text-sm font-mono hover:bg-green/10 transition-colors">
              Done ✓
            </button>
          )}
        </div>
      )}
    </div>
  );
}

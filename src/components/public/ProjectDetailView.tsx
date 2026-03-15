"use client";
import { useEffect, useState, useCallback } from "react";
import { Project, FileNode, Highlight } from "@/types";
import {
  Github, ExternalLink, ChevronRight, ChevronDown,
  Folder, File, Loader2, Star, GitFork, Clock, GitCommit,
  Code2, Network, Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface RepoInfo { stars: number; forks: number; language: string; updatedAt: string; }
interface Commit   { sha: string; message: string; author: string; date: string; url: string; }

const TAG_STYLE: Record<string, string> = {
  architecture: "bg-purple-500/20 text-purple-400",
  performance:  "bg-orange-500/20 text-orange-400",
  "ai-logic":   "bg-pink-500/20 text-pink-400",
  security:     "bg-red-500/20 text-red-400",
  core:         "bg-green/20 text-green",
  other:        "bg-surface text-dim",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30)  return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12)  return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

type Tab = "code" | "architecture";

export default function ProjectDetailView({ slug }: { slug: string }) {
  const [project,     setProject]     = useState<Project | null>(null);
  const [tree,        setTree]        = useState<FileNode[]>([]);
  const [activeFile,  setActiveFile]  = useState<string | null>(null);
  const [code,        setCode]        = useState("");
  const [lang,        setLang]        = useState("plaintext");
  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [treeError,   setTreeError]   = useState("");
  const [notFound,    setNotFound]    = useState(false);
  const [repoInfo,    setRepoInfo]    = useState<RepoInfo | null>(null);
  const [commits,     setCommits]     = useState<Commit[]>([]);
  const [showCommits, setShowCommits] = useState(false);
  const [highlights,  setHighlights]  = useState<Highlight[]>([]);
  const [tab,         setTab]         = useState<Tab>("code");
  const [explaining,  setExplaining]  = useState(false);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${slug}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); return; }
        const p = await r.json();
        if (p.error) { setNotFound(true); return; }
        setProject(p);

        if (p.githubOwner && p.githubRepo) {
          const base = `/api/github/file?owner=${p.githubOwner}&repo=${p.githubRepo}`;
          setLoadingTree(true);
          fetch(`/api/github/tree?owner=${p.githubOwner}&repo=${p.githubRepo}&branch=${p.branch || "main"}`)
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setTree(d); else setTreeError("Could not load repository tree."); setLoadingTree(false); })
            .catch(() => { setTreeError("Could not load repository tree."); setLoadingTree(false); });
          fetch(`${base}&type=info`).then(r => r.json()).then(d => d && !d.error && setRepoInfo(d)).catch(() => {});
          fetch(`${base}&type=commits`).then(r => r.json()).then(d => Array.isArray(d) && setCommits(d)).catch(() => {});
        }

        // Load highlights for this project
        fetch(`/api/highlights?slug=${slug}`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setHighlights(d); })
          .catch(() => {});
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const openFile = useCallback(async (path: string, language: string) => {
    if (!project?.githubOwner || !project?.githubRepo) return;
    setActiveFile(path);
    setLoadingFile(true);
    try {
      const r = await fetch(
        `/api/github/file?owner=${project.githubOwner}&repo=${project.githubRepo}&path=${encodeURIComponent(path)}`
      );
      const d = await r.json();
      setCode(d.content || "");
      setLang(d.language || language);
    } catch {
      setCode("// Failed to load file");
    }
    setLoadingFile(false);
  }, [project]);

  async function explainFile() {
    if (!activeFile || !code || !project) return;
    setExplaining(true);
    setExplanation("");
    try {
      const r = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lang,
          filePath: activeFile,
          projectTitle: project.title,
        }),
      });

      if (!r.ok || !r.body) {
        const d = await r.json().catch(() => ({}));
        setExplanation(`Error: ${d.error || r.statusText}`);
        setExplaining(false);
        return;
      }

      // Parse OpenAI SSE stream
      // Format: data: {"choices":[{"delta":{"content":"text"},...}]}
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            // OpenAI streaming delta format
            const delta = parsed?.choices?.[0]?.delta?.content || "";
            if (delta) setExplanation(prev => prev + delta);
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (e: any) {
      setExplanation(`Failed to get explanation: ${e.message}`);
    }
    setExplaining(false);
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-2xl font-black text-text mb-2">404</p>
          <p className="text-muted text-sm">Project not found.</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-green" /></div>;
  }

  const hasGithub = !!(project.githubOwner && project.githubRepo);
  const hasArch   = !!(project.architectureUrl || project.architectureDiagram);
  // Highlights for the currently open file
  const fileHighlights = highlights.filter(h => h.filePath === activeFile);

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        {project.banner && (
          <img src={project.banner} alt={project.title}
            className="w-full h-48 object-cover rounded-2xl mb-5 border border-border" />
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-text mb-2">{project.title}</h1>
            {project.description && <p className="text-muted text-sm max-w-2xl">{project.description}</p>}
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            {hasGithub && (
              <a href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-text hover:border-green/40 transition-colors">
                <Github size={14} /> GitHub
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green text-bg rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.techStack.map(t => (
            <span key={t} className="font-mono text-xs bg-card border border-border text-muted px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Repo stats bar ─────────────────────────────────────── */}
      {hasGithub && repoInfo && (
        <div className="flex items-center gap-6 flex-wrap bg-card border border-border rounded-xl px-5 py-3">
          {repoInfo.language && (
            <span className="flex items-center gap-1.5 text-xs text-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-green inline-block" />{repoInfo.language}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <Star size={12} className="text-yellow-400" />{repoInfo.stars}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <GitFork size={12} />{repoInfo.forks}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <Clock size={12} />Updated {timeAgo(repoInfo.updatedAt)}
          </span>
          {commits.length > 0 && (
            <button onClick={() => setShowCommits(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted font-mono hover:text-green transition-colors ml-auto">
              <GitCommit size={12} />{showCommits ? "Hide" : "Show"} recent commits
            </button>
          )}
        </div>
      )}

      {/* ── Commit timeline ────────────────────────────────────── */}
      {showCommits && commits.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <span className="font-mono text-[10px] text-muted">RECENT COMMITS</span>
          </div>
          <div className="divide-y divide-border">
            {commits.map(c => (
              <a key={c.sha} href={c.url} target="_blank" rel="noreferrer"
                className="flex items-start gap-4 px-4 py-3 hover:bg-surface transition-colors group">
                <span className="font-mono text-[10px] text-dim bg-surface border border-border px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 group-hover:border-green/30 transition-colors">
                  {c.sha}
                </span>
                <span className="text-text text-sm flex-1 truncate group-hover:text-green transition-colors">{c.message}</span>
                <span className="font-mono text-[10px] text-dim flex-shrink-0">{timeAgo(c.date)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Long description ───────────────────────────────────── */}
      {project.longDescription && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-3">// ABOUT THIS PROJECT</p>
          <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{project.longDescription}</p>
        </div>
      )}

      {/* ── Code / Architecture tabs ───────────────────────────── */}
      {(hasGithub || hasArch) && (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Tab bar */}
          <div className="bg-card border-b border-border flex">
            {hasGithub && (
              <button
                onClick={() => setTab("code")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 transition-colors
                  ${tab === "code" ? "border-green text-green" : "border-transparent text-muted hover:text-text"}`}
              >
                <Code2 size={12} /> Code Explorer
              </button>
            )}
            {hasArch && (
              <button
                onClick={() => setTab("architecture")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 transition-colors
                  ${tab === "architecture" ? "border-green text-green" : "border-transparent text-muted hover:text-text"}`}
              >
                <Network size={12} /> Architecture
              </button>
            )}
            {tab === "code" && hasGithub && (
              <span className="font-mono text-[10px] text-dim px-4 py-2.5 ml-auto flex items-center">
                {project.githubOwner}/{project.githubRepo}
              </span>
            )}
          </div>

          {/* Code tab */}
          {tab === "code" && hasGithub && (
            <>
              <div className="flex h-[500px]">
                {/* File tree */}
                <div className="w-64 shrink-0 border-r border-border overflow-y-auto bg-surface">
                  {loadingTree ? (
                    <div className="p-4 text-center"><Loader2 size={14} className="animate-spin text-green mx-auto" /></div>
                  ) : treeError ? (
                    <p className="p-4 text-xs text-red-400">{treeError}</p>
                  ) : (
                    <div className="p-2">
                      {tree.map(node => (
                        <TreeNode key={node.path} node={node} activeFile={activeFile} onFileClick={openFile} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Code viewer */}
                <div className="flex-1 overflow-hidden">
                  {!activeFile ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-mono text-[10px] text-dim mb-2">SELECT A FILE TO VIEW CODE</p>
                        <p className="text-muted text-xs">Click any file in the explorer →</p>
                      </div>
                    </div>
                  ) : loadingFile ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-green" />
                    </div>
                  ) : (
                    <MonacoEditor
                      height="500px" language={lang} value={code} theme="vs-dark"
                      options={{
                        readOnly: true, minimap: { enabled: false }, fontSize: 13,
                        fontFamily: '"JetBrains Mono", "Space Mono", monospace',
                        scrollBeyondLastLine: false, padding: { top: 16 },
                        lineNumbers: "on", folding: true, wordWrap: "on",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Active file footer + AI explain */}
              {activeFile && (
                <div className="bg-card border-t border-border px-4 py-1.5 flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] text-dim truncate">{activeFile}</span>
                  <button
                    onClick={explainFile}
                    disabled={explaining || !code}
                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-[10px] font-mono hover:bg-purple-500/20 disabled:opacity-50 transition-colors shrink-0"
                  >
                    <Sparkles size={10} />
                    {explaining ? "Explaining..." : "Explain file"}
                  </button>
                </div>
              )}

              {/* AI explanation panel */}
              {explanation && (
                <div className="border-t border-border p-4 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-purple-400" />
                    <p className="font-mono text-[10px] text-purple-400">AI EXPLANATION</p>
                    <button onClick={() => setExplanation("")}
                      className="ml-auto font-mono text-[10px] text-dim hover:text-text transition-colors">
                      ✕ dismiss
                    </button>
                  </div>
                  <p className="text-text text-sm leading-relaxed">{explanation}</p>
                </div>
              )}

              {/* Highlights panel */}
              {fileHighlights.length > 0 && (
                <div className="border-t border-border p-4 space-y-3 bg-surface">
                  <p className="font-mono text-[10px] text-muted">// CODE HIGHLIGHTS</p>
                  {fileHighlights.map(h => (
                    <div key={h._id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize ${TAG_STYLE[h.tag]}`}>
                          {h.tag}
                        </span>
                        <span className="font-semibold text-text text-sm">{h.title}</span>
                        {(h.startLine || h.endLine) && (
                          <span className="font-mono text-[10px] text-dim ml-auto">
                            Lines {h.startLine}–{h.endLine}
                          </span>
                        )}
                      </div>
                      {h.description && <p className="text-muted text-xs leading-relaxed">{h.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Architecture tab */}
          {tab === "architecture" && hasArch && (
            <div className="p-6 space-y-4">
              {project.architectureUrl && (
                <img src={project.architectureUrl} alt="Architecture diagram"
                  className="w-full rounded-xl border border-border" />
              )}
              {project.architectureDiagram && (
                <div className="bg-surface border border-border rounded-xl p-5">
                  <p className="font-mono text-[10px] text-muted mb-3">// SYSTEM DESCRIPTION</p>
                  <pre className="text-text text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs">
                    {project.architectureDiagram}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!hasGithub && !hasArch && (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <p className="text-dim text-sm">No GitHub repository or architecture diagram linked to this project.</p>
        </div>
      )}
    </div>
  );
}

function TreeNode({
  node, depth = 0, activeFile, onFileClick,
}: {
  node: FileNode; depth?: number;
  activeFile: string | null;
  onFileClick: (path: string, lang: string) => void;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "folder") {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)}
          className="file-node flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs text-muted hover:text-text transition-colors"
          style={{ paddingLeft: `${8 + depth * 12}px` }}>
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          <Folder size={12} className="text-yellow-500/70" />
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children?.map(child => (
          <TreeNode key={child.path} node={child} depth={depth + 1} activeFile={activeFile} onFileClick={onFileClick} />
        ))}
      </div>
    );
  }

  const isActive = activeFile === node.path;
  return (
    <button onClick={() => onFileClick(node.path, node.lang || "plaintext")}
      className={`file-node flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs transition-colors
        ${isActive ? "active" : "text-dim hover:text-muted"}`}
      style={{ paddingLeft: `${20 + depth * 12}px` }}>
      <File size={11} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

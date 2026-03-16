"use client";
import { useEffect, useState, useCallback } from "react";
import { Project, FileNode, Highlight } from "@/types";
import {
  Github, ExternalLink, ChevronRight, ChevronDown,
  Folder, File, Loader2, Star, GitFork, Clock, GitCommit,
  Code2, Network, Sparkles, Play, Video, Users, Tag,
  GitBranch, Package, AlertCircle, Globe, Eye, Heart,
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface RepoInfo {
  stars: number; forks: number; language: string; updatedAt: string;
  openIssues?: number; license?: string; homepage?: string;
  size?: number; watchers?: number;
}
interface Commit      { sha: string; message: string; author: string; date: string; url: string; }
interface Release     { tag: string; name: string; published: string; url: string; prerelease: boolean; }
interface Contributor { login: string; avatar: string; contributions: number; url: string; }

const TAG_STYLE: Record<string, string> = {
  architecture: "bg-purple-500/20 text-purple-400",
  performance:  "bg-orange-500/20 text-orange-400",
  "ai-logic":   "bg-pink-500/20 text-pink-400",
  security:     "bg-red-500/20 text-red-400",
  core:         "bg-green/20 text-green",
  other:        "bg-surface text-dim",
};

function timeAgo(iso: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30)  return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12)  return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Tab = "code" | "architecture" | "releases" | "contributors";

export default function ProjectDetailView({ slug }: { slug: string }) {
  const [project,      setProject]      = useState<Project | null>(null);
  const [tree,         setTree]         = useState<FileNode[]>([]);
  const [activeFile,   setActiveFile]   = useState<string | null>(null);
  const [code,         setCode]         = useState("");
  const [lang,         setLang]         = useState("plaintext");
  const [loadingTree,  setLoadingTree]  = useState(false);
  const [loadingFile,  setLoadingFile]  = useState(false);
  const [treeError,    setTreeError]    = useState("");
  const [notFound,     setNotFound]     = useState(false);
  const [repoInfo,     setRepoInfo]     = useState<RepoInfo | null>(null);
  const [commits,      setCommits]      = useState<Commit[]>([]);
  const [showCommits,  setShowCommits]  = useState(false);
  const [highlights,   setHighlights]   = useState<Highlight[]>([]);
  const [tab,          setTab]          = useState<Tab>("code");
  const [explaining,   setExplaining]   = useState(false);
  const [explanation,  setExplanation]  = useState("");
  const [releases,     setReleases]     = useState<Release[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [branches,     setBranches]     = useState<string[]>([]);
  const [liked,        setLiked]        = useState(false);
  const [likeCount,    setLikeCount]    = useState(0);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetch(`/api/projects/${slug}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); return; }
        const p = await r.json();
        if (p.error) { setNotFound(true); return; }
        setProject(p);
        setLikeCount(p.likes || 0);

        if (p.githubOwner && p.githubRepo) {
          const base = `/api/github/file?owner=${p.githubOwner}&repo=${p.githubRepo}`;
          const q    = `owner=${p.githubOwner}&repo=${p.githubRepo}`;
          setLoadingTree(true);
          fetch(`/api/github/tree?owner=${p.githubOwner}&repo=${p.githubRepo}&branch=${p.branch || "main"}`)
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setTree(d); else setTreeError("Could not load repository tree."); })
            .catch(() => setTreeError("Could not load repository tree."))
            .finally(() => setLoadingTree(false));
          fetch(`${base}&type=info`).then(r => r.json()).then(d => d && !d.error && setRepoInfo(d)).catch(() => {});
          fetch(`${base}&type=commits`).then(r => r.json()).then(d => Array.isArray(d) && setCommits(d)).catch(() => {});
          fetch(`/api/github/releases?${q}`).then(r => r.json()).then(d => Array.isArray(d) && setReleases(d)).catch(() => {});
          fetch(`/api/github/contributors?${q}`).then(r => r.json()).then(d => Array.isArray(d) && setContributors(d)).catch(() => {});
          fetch(`/api/github/branches?${q}`).then(r => r.json()).then(d => Array.isArray(d) && setBranches(d)).catch(() => {});
        }
        fetch(`/api/highlights?slug=${slug}`)
          .then(r => r.json()).then(d => Array.isArray(d) && setHighlights(d)).catch(() => {});
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const openFile = useCallback(async (path: string, language: string) => {
    if (!project?.githubOwner || !project?.githubRepo) return;
    setActiveFile(path);
    setLoadingFile(true);
    try {
      const r = await fetch(`/api/github/file?owner=${project.githubOwner}&repo=${project.githubRepo}&path=${encodeURIComponent(path)}`);
      const d = await r.json();
      setCode(d.content || "");
      setLang(d.language || language);
    } catch { setCode("// Failed to load file"); }
    setLoadingFile(false);
  }, [project]);

  function handleLike() {
    if (liked || !project) return;
    setLiked(true);
    setLikeCount(n => n + 1);
    fetch(`/api/projects/${project._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likes: likeCount + 1 }),
    }).catch(() => {});
  }

  async function explainFile() {
    if (!activeFile || !code || !project) return;
    setExplaining(true);
    setExplanation("");
    try {
      const r = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: lang, filePath: activeFile, projectTitle: project.title }),
      });
      if (!r.ok || !r.body) {
        const d = await r.json().catch(() => ({}));
        setExplanation(`Error: ${d.error || r.statusText}`);
        setExplaining(false);
        return;
      }
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
            const delta = parsed?.choices?.[0]?.delta?.content || "";
            if (delta) setExplanation(prev => prev + delta);
          } catch { /* skip */ }
        }
      }
    } catch (e: any) { setExplanation(`Failed: ${e.message}`); }
    setExplaining(false);
  }

  if (notFound) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><p className="text-2xl font-black text-text mb-2">404</p><p className="text-muted text-sm">Project not found.</p></div>
    </div>
  );
  if (!project) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-green" /></div>;

  const hasGithub      = !!(project.githubOwner && project.githubRepo);
  const hasArch        = !!(project.architectureUrl || project.architectureDiagram);
  const fileHighlights = highlights.filter(h => h.filePath === activeFile);
  const hasDemo        = !!(project.demoUrl || project.liveUrl);

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

      {project.banner && (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img src={project.banner} alt={project.title} className="w-full h-52 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className={`transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-3xl font-black text-text">{project.title}</h1>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border
                ${project.status === "active" ? "bg-green/10 text-green border-green/20"
                  : project.status === "completed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                {project.status}
              </span>
            </div>
            {project.description && <p className="text-muted text-sm max-w-2xl leading-relaxed">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {project.videoUrl && (
              <a href={project.videoUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted hover:text-purple-400 hover:border-purple-500/30 transition-colors">
                <Video size={14} /> Demo Video
              </a>
            )}
            {hasGithub && (
              <a href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-text hover:border-green/40 transition-colors">
                <Github size={14} /> GitHub
              </a>
            )}
            {hasDemo && (
              <a href={project.demoUrl || project.liveUrl!} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green text-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                <Play size={13} fill="currentColor" /> Live Demo
              </a>
            )}
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all
                ${liked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-card border-border text-muted hover:text-red-400 hover:border-red-500/20"}`}>
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
              {likeCount > 0 && <span className="font-mono text-xs">{likeCount}</span>}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.techStack.map(t => (
            <span key={t} className="font-mono text-xs bg-card border border-border text-muted px-3 py-1 rounded-full hover:border-green/30 transition-colors">{t}</span>
          ))}
          {(project.topics || []).map(t => (
            <span key={t} className="font-mono text-xs bg-green/5 border border-green/15 text-green/70 px-3 py-1 rounded-full flex items-center gap-1">
              <Tag size={9} />{t}
            </span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {hasGithub && repoInfo && (
        <div className="flex items-center gap-4 flex-wrap bg-card border border-border rounded-xl px-5 py-3">
          {repoInfo.language && <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><span className="w-2.5 h-2.5 rounded-full bg-green" />{repoInfo.language}</span>}
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><Star size={12} className="text-yellow-400" />{repoInfo.stars?.toLocaleString() || 0}</span>
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><GitFork size={12} />{repoInfo.forks?.toLocaleString() || 0}</span>
          {repoInfo.openIssues !== undefined && <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><AlertCircle size={12} className="text-orange-400" />{repoInfo.openIssues} issues</span>}
          {repoInfo.watchers !== undefined && <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><Eye size={12} />{repoInfo.watchers}</span>}
          {repoInfo.license && <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><Package size={12} />{repoInfo.license}</span>}
          {branches.length > 0 && <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><GitBranch size={12} />{branches.length} branches</span>}
          {repoInfo.updatedAt && <span className="flex items-center gap-1.5 text-xs font-mono text-muted"><Clock size={12} />Updated {timeAgo(repoInfo.updatedAt)}</span>}
          {repoInfo.homepage && (
            <a href={repoInfo.homepage} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-mono text-green hover:underline ml-auto">
              <Globe size={11} />{repoInfo.homepage.replace(/^https?:\/\//, "")}
            </a>
          )}
          {commits.length > 0 && (
            <button onClick={() => setShowCommits(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${repoInfo.homepage ? "" : "ml-auto"} ${showCommits ? "text-green" : "text-muted hover:text-green"}`}>
              <GitCommit size={12} />{showCommits ? "Hide" : "Show"} commits
            </button>
          )}
        </div>
      )}

      {/* Commit timeline */}
      {showCommits && commits.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border"><span className="font-mono text-[10px] text-muted">RECENT COMMITS</span></div>
          <div className="divide-y divide-border">
            {commits.map(c => (
              <a key={c.sha} href={c.url} target="_blank" rel="noreferrer"
                className="flex items-start gap-4 px-4 py-3 hover:bg-surface transition-colors group">
                <span className="font-mono text-[10px] text-dim bg-surface border border-border px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 group-hover:border-green/30">{c.sha}</span>
                <span className="text-text text-sm flex-1 truncate group-hover:text-green">{c.message}</span>
                <span className="font-mono text-[10px] text-dim flex-shrink-0">{timeAgo(c.date)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {project.longDescription && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="font-mono text-[10px] text-muted mb-3">// ABOUT THIS PROJECT</p>
          <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{project.longDescription}</p>
        </div>
      )}

      {/* Tabs */}
      {(hasGithub || hasArch) && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-card border-b border-border flex overflow-x-auto">
            {hasGithub && (
              <button onClick={() => setTab("code")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 whitespace-nowrap transition-colors ${tab === "code" ? "border-green text-green" : "border-transparent text-muted hover:text-text"}`}>
                <Code2 size={12} /> Code
              </button>
            )}
            {hasArch && (
              <button onClick={() => setTab("architecture")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 whitespace-nowrap transition-colors ${tab === "architecture" ? "border-green text-green" : "border-transparent text-muted hover:text-text"}`}>
                <Network size={12} /> Architecture
              </button>
            )}
            {hasGithub && (
              <button onClick={() => setTab("releases")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 whitespace-nowrap transition-colors ${tab === "releases" ? "border-green text-green" : "border-transparent text-muted hover:text-text"}`}>
                <Package size={12} /> Releases {releases.length > 0 && <span className="bg-green/20 text-green text-[10px] rounded-full px-1.5">{releases.length}</span>}
              </button>
            )}
            {hasGithub && (
              <button onClick={() => setTab("contributors")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 whitespace-nowrap transition-colors ${tab === "contributors" ? "border-green text-green" : "border-transparent text-muted hover:text-text"}`}>
                <Users size={12} /> Contributors {contributors.length > 0 && <span className="bg-green/20 text-green text-[10px] rounded-full px-1.5">{contributors.length}</span>}
              </button>
            )}
            {tab === "code" && hasGithub && (
              <div className="ml-auto px-4 py-2.5 flex items-center gap-2">
                {branches.length > 0 && <span className="flex items-center gap-1 text-[10px] font-mono text-dim"><GitBranch size={10} />{project.branch || "main"}</span>}
                <span className="font-mono text-[10px] text-dim hidden sm:block">{project.githubOwner}/{project.githubRepo}</span>
              </div>
            )}
          </div>

          {/* Code tab */}
          {tab === "code" && hasGithub && (
            <>
              <div className="flex h-[520px]">
                <div className="w-60 shrink-0 border-r border-border overflow-y-auto bg-surface">
                  {loadingTree ? <div className="p-4 text-center"><Loader2 size={14} className="animate-spin text-green mx-auto" /></div>
                    : treeError ? <p className="p-4 text-xs text-red-400">{treeError}</p>
                    : <div className="p-2">{tree.map(node => <TreeNode key={node.path} node={node} activeFile={activeFile} onFileClick={openFile} />)}</div>}
                </div>
                <div className="flex-1 overflow-hidden">
                  {!activeFile ? (
                    <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
                      <div className="text-center"><Code2 size={32} className="text-dim mx-auto mb-3" /><p className="font-mono text-[10px] text-dim">SELECT A FILE TO VIEW CODE</p></div>
                    </div>
                  ) : loadingFile ? (
                    <div className="h-full flex items-center justify-center bg-[#1e1e1e]"><Loader2 className="animate-spin text-green" /></div>
                  ) : (
                    <MonacoEditor height="520px" language={lang} value={code} theme="vs-dark"
                      options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: '"JetBrains Mono","Space Mono",monospace', scrollBeyondLastLine: false, padding: { top: 16 }, lineNumbers: "on", folding: true, wordWrap: "on" }} />
                  )}
                </div>
              </div>
              {activeFile && (
                <div className="bg-card border-t border-border px-4 py-1.5 flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] text-dim truncate">{activeFile}</span>
                  <button onClick={explainFile} disabled={explaining || !code}
                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-[10px] font-mono hover:bg-purple-500/20 disabled:opacity-50 transition-colors shrink-0">
                    <Sparkles size={10} />{explaining ? "Explaining..." : "Explain file"}
                  </button>
                </div>
              )}
              {explanation && (
                <div className="border-t border-border p-4 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-purple-400" />
                    <p className="font-mono text-[10px] text-purple-400">AI EXPLANATION</p>
                    <button onClick={() => setExplanation("")} className="ml-auto font-mono text-[10px] text-dim hover:text-text">✕ dismiss</button>
                  </div>
                  <p className="text-text text-sm leading-relaxed">{explanation}</p>
                </div>
              )}
              {fileHighlights.length > 0 && (
                <div className="border-t border-border p-4 space-y-3 bg-surface">
                  <p className="font-mono text-[10px] text-muted">// CODE HIGHLIGHTS</p>
                  {fileHighlights.map(h => (
                    <div key={h._id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize ${TAG_STYLE[h.tag]}`}>{h.tag}</span>
                        <span className="font-semibold text-text text-sm">{h.title}</span>
                        {(h.startLine || h.endLine) && <span className="font-mono text-[10px] text-dim ml-auto">Lines {h.startLine}–{h.endLine}</span>}
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
              {project.architectureUrl && <img src={project.architectureUrl} alt="Architecture" className="w-full rounded-xl border border-border" />}
              {project.architectureDiagram && (
                <div className="bg-surface border border-border rounded-xl p-5">
                  <p className="font-mono text-[10px] text-muted mb-3">// SYSTEM DESCRIPTION</p>
                  <pre className="text-text text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs">{project.architectureDiagram}</pre>
                </div>
              )}
            </div>
          )}

          {/* Releases tab */}
          {tab === "releases" && (
            <div className="p-5">
              {releases.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={28} className="text-dim mx-auto mb-3" />
                  <p className="text-dim text-sm">No releases yet.</p>
                  {hasGithub && <a href={`https://github.com/${project.githubOwner}/${project.githubRepo}/releases/new`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-green font-mono hover:underline"><ExternalLink size={11} /> Create release on GitHub</a>}
                </div>
              ) : (
                <div className="space-y-3">
                  {releases.map((r, i) => (
                    <a key={r.tag} href={r.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-green/30 transition-colors group">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${r.prerelease ? "bg-orange-500/10 text-orange-400" : "bg-green/10 text-green"}`}>
                        <Package size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-text text-sm group-hover:text-green transition-colors">{r.name || r.tag}</span>
                          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${r.prerelease ? "bg-orange-500/20 text-orange-400" : "bg-green/20 text-green"}`}>{r.prerelease ? "pre-release" : "stable"}</span>
                          {i === 0 && !r.prerelease && <span className="font-mono text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">latest</span>}
                        </div>
                        <p className="font-mono text-[10px] text-dim">{r.tag} · {fmtDate(r.published)}</p>
                      </div>
                      <ExternalLink size={13} className="text-dim group-hover:text-green flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contributors tab */}
          {tab === "contributors" && (
            <div className="p-5">
              {contributors.length === 0 ? (
                <div className="text-center py-12"><Users size={28} className="text-dim mx-auto mb-3" /><p className="text-dim text-sm">No contributors data.</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contributors.map((c, i) => (
                    <a key={c.login} href={c.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 hover:border-green/30 transition-colors group">
                      <div className="relative flex-shrink-0">
                        <img src={c.avatar} alt={c.login} className="w-10 h-10 rounded-full ring-2 ring-border group-hover:ring-green/30 transition-all" />
                        {i === 0 && <span className="absolute -top-1 -right-1 text-[9px] bg-yellow-500 text-bg rounded-full w-4 h-4 flex items-center justify-center font-bold">★</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text text-sm group-hover:text-green">{c.login}</p>
                        <p className="font-mono text-[10px] text-dim">{c.contributions} commits</p>
                      </div>
                      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-green/70 rounded-full" style={{ width: `${Math.min(100, (c.contributions / (contributors[0]?.contributions || 1)) * 100)}%` }} />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!hasGithub && !hasArch && (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <Github size={24} className="text-dim mx-auto mb-3" />
          <p className="text-dim text-sm">No GitHub repository or architecture diagram linked.</p>
        </div>
      )}
    </div>
  );
}

function TreeNode({ node, depth = 0, activeFile, onFileClick }: { node: FileNode; depth?: number; activeFile: string | null; onFileClick: (path: string, lang: string) => void; }) {
  const [open, setOpen] = useState(depth < 1);
  if (node.type === "folder") {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)} className="file-node flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs text-muted hover:text-text transition-colors" style={{ paddingLeft: `${8 + depth * 12}px` }}>
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          <Folder size={12} className="text-yellow-500/70" />
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children?.map(child => <TreeNode key={child.path} node={child} depth={depth + 1} activeFile={activeFile} onFileClick={onFileClick} />)}
      </div>
    );
  }
  return (
    <button onClick={() => onFileClick(node.path, node.lang || "plaintext")}
      className={`file-node flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs transition-colors ${activeFile === node.path ? "active" : "text-dim hover:text-muted"}`}
      style={{ paddingLeft: `${20 + depth * 12}px` }}>
      <File size={11} /><span className="truncate">{node.name}</span>
    </button>
  );
}

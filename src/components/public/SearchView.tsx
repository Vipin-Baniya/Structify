"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Folder, Trophy, Award, Cpu, Loader2 } from "lucide-react";

interface SearchResults {
  projects:     { _id: string; title: string; slug: string; description?: string; techStack: string[]; status: string; banner?: string }[];
  achievements: { _id: string; title: string; organization?: string; type: string }[];
  certificates: { _id: string; title: string; issuer?: string; category: string }[];
  skills:       { _id: string; name: string; category: string; proficiency: number }[];
}

const EMPTY: SearchResults = { projects: [], achievements: [], certificates: [], skills: [] };

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green/20 text-green",
  completed: "bg-blue-500/20 text-blue-400",
  research:  "bg-purple-500/20 text-purple-400",
};

const BROWSE_CATEGORIES = [
  { label: "Projects",      href: "/projects",      emoji: "🗂️",  gradient: "from-[#1d62d6] to-[#0d3d8e]" },
  { label: "Skills",        href: "/skills",        emoji: "⚡",   gradient: "from-[#e8712a] to-[#8b3f10]" },
  { label: "Achievements",  href: "/achievements",  emoji: "🏆",  gradient: "from-[#c6a227] to-[#7a5e0a]" },
  { label: "Certificates",  href: "/certificates",  emoji: "🎓",  gradient: "from-[#8b46d4] to-[#4a1a80]" },
  { label: "Experience",    href: "/experience",    emoji: "💼",  gradient: "from-[#1db954] to-[#0d6e31]" },
  { label: "Notes",         href: "/blog",          emoji: "📝",  gradient: "from-[#e8457a] to-[#8b1a3e]" },
  { label: "Testimonials",  href: "/testimonials",  emoji: "💬",  gradient: "from-[#1ba0a0] to-[#0a5555]" },
  { label: "About",         href: "/about",         emoji: "👤",  gradient: "from-[#5c7a9e] to-[#2a3d52]" },
  { label: "Contact",       href: "/contact",       emoji: "📬",  gradient: "from-[#d94f4f] to-[#7a1e1e]" },
];

export default function SearchView() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initialQ     = searchParams.get("q") || "";

  const [query,   setQuery]   = useState(initialQ);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Run search if query in URL on load
  useEffect(() => {
    if (initialQ.length >= 2) doSearch(initialQ);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function doSearch(q: string) {
    if (q.length < 2) { setResults(EMPTY); setSearched(false); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d.error ? EMPTY : d); setSearched(true); })
      .catch(() => setResults(EMPTY))
      .finally(() => setLoading(false));
  }

  function handleChange(v: string) {
    setQuery(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search", { scroll: false });
      doSearch(v);
    }, 300);
  }

  const total = results.projects.length + results.achievements.length +
                results.certificates.length + results.skills.length;

  const isIdle = query.length < 2 && !loading;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black text-text mb-6">Search</h1>

      {/* Spotify-style search bar: white background, dark text, pill shape */}
      <div className="relative mb-8">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#121212] pointer-events-none z-10" />
        {loading && (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#121212] animate-spin z-10" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="What do you want to find?"
          className="w-full bg-white text-[#121212] placeholder:text-[#6b6b6b] rounded-full pl-12 pr-12 py-3.5 text-sm font-medium outline-none shadow-lg transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(29,185,84,0.5)] focus:scale-[1.01]"
        />
      </div>

      {/* Browse all — shown when idle (no active search query) */}
      {isIdle && (
        <section className="animate-fade-in-up">
          <h2 className="text-xl font-bold text-text mb-4">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BROWSE_CATEGORIES.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`spotify-category-card relative h-32 rounded-xl overflow-hidden bg-gradient-to-br ${cat.gradient} select-none`}
              >
                <span className="absolute top-4 left-4 font-bold text-white text-base leading-tight drop-shadow">
                  {cat.label}
                </span>
                <span className="absolute -bottom-2 -right-1 text-[4.5rem] leading-none rotate-[-15deg] drop-shadow-lg select-none pointer-events-none">
                  {cat.emoji}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="text-green animate-spin" />
        </div>
      )}

      {/* No results */}
      {searched && !loading && total === 0 && (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-text font-bold text-lg mb-1">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-dim text-sm">Make sure all words are spelled correctly, or try different keywords.</p>
        </div>
      )}

      {/* Search results */}
      {searched && !loading && total > 0 && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Projects */}
          {results.projects.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Folder size={14} className="text-green" />
                <h2 className="text-xs font-mono text-muted uppercase tracking-widest">Projects</h2>
                <span className="font-mono text-[10px] text-dim">({results.projects.length})</span>
              </div>
              <div className="space-y-2">
                {results.projects.map(p => (
                  <Link key={p._id} href={`/projects/${p.slug}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-[#1a1a1a] hover:border-green/30 transition-all group">
                    {p.banner
                      ? <img src={p.banner} alt={p.title} className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-12 h-9 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0 font-mono text-green/30 text-xs">{"{}"}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text text-sm group-hover:text-green transition-colors">{p.title}</p>
                      {p.description && <p className="text-dim text-xs truncate">{p.description}</p>}
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {results.skills.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={14} className="text-cyan-400" />
                <h2 className="text-xs font-mono text-muted uppercase tracking-widest">Skills</h2>
                <span className="font-mono text-[10px] text-dim">({results.skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.skills.map(s => (
                  <Link key={s._id} href="/skills"
                    className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-text hover:bg-[#1a1a1a] hover:border-green/30 transition-all">
                    {s.name}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`block w-1.5 h-1.5 rounded-full ${i <= s.proficiency ? "bg-green" : "bg-border"}`} />
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {results.achievements.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="text-yellow-400" />
                <h2 className="text-xs font-mono text-muted uppercase tracking-widest">Achievements</h2>
                <span className="font-mono text-[10px] text-dim">({results.achievements.length})</span>
              </div>
              <div className="space-y-2">
                {results.achievements.map(a => (
                  <Link key={a._id} href="/achievements"
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-[#1a1a1a] hover:border-green/30 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <Trophy size={14} className="text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text text-sm group-hover:text-green transition-colors">{a.title}</p>
                      {a.organization && <p className="text-dim text-xs">{a.organization}</p>}
                    </div>
                    <span className="font-mono text-[10px] text-dim capitalize ml-auto">{a.type}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Certificates */}
          {results.certificates.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Award size={14} className="text-blue-400" />
                <h2 className="text-xs font-mono text-muted uppercase tracking-widest">Certificates</h2>
                <span className="font-mono text-[10px] text-dim">({results.certificates.length})</span>
              </div>
              <div className="space-y-2">
                {results.certificates.map(c => (
                  <Link key={c._id} href="/certificates"
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-[#1a1a1a] hover:border-green/30 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Award size={14} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text text-sm group-hover:text-green transition-colors">{c.title}</p>
                      {c.issuer && <p className="text-dim text-xs">{c.issuer}</p>}
                    </div>
                    <span className="font-mono text-[10px] text-dim capitalize ml-auto">{c.category}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

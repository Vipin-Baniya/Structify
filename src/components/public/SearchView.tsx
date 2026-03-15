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

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black text-text mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
        {loading && (
          <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-green animate-spin" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search projects, skills, achievements..."
          className="w-full bg-card border border-border rounded-xl pl-11 pr-11 py-3 text-text text-sm outline-none focus:border-green/40 transition-colors"
        />
      </div>

      {/* Results */}
      {!searched && !loading && (
        <div className="text-center py-16">
          <p className="text-dim text-sm">Type at least 2 characters to search.</p>
        </div>
      )}

      {searched && total === 0 && (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {searched && total > 0 && (
        <div className="space-y-8">
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
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-green/30 transition-colors group">
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
                    className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-green/30 transition-colors">
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
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-green/30 transition-colors group">
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
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-green/30 transition-colors group">
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

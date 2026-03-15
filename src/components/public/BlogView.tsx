"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { ArrowRight, BookOpen } from "lucide-react";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogView() {
  const [posts, setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPosts(d); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-black text-text mb-1">Notes</h1>
      <p className="text-muted text-sm mb-8">Engineering insights, learnings, and ideas.</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <BookOpen size={24} className="text-dim mx-auto mb-3" />
          <p className="text-dim text-sm">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <Link key={p._id} href={`/blog/${p.slug}`}>
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-green/30 transition-colors group flex">
                {p.coverUrl && (
                  <img src={p.coverUrl} alt={p.title} className="w-32 h-full object-cover shrink-0 hidden sm:block" />
                )}
                <div className="p-5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="font-bold text-text group-hover:text-green transition-colors">{p.title}</h2>
                    <span className="font-mono text-[10px] text-dim shrink-0">{fmtDate(p.createdAt)}</span>
                  </div>
                  {p.excerpt && <p className="text-muted text-sm line-clamp-2 mb-3">{p.excerpt}</p>}
                  <div className="flex items-center gap-3">
                    {p.tags.slice(0, 3).map(t => (
                      <span key={t} className="font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded">{t}</span>
                    ))}
                    <ArrowRight size={12} className="ml-auto text-dim group-hover:text-green transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

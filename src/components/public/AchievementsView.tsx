"use client";
import { useEffect, useState } from "react";
import { Achievement } from "@/types";
import { Trophy, ExternalLink } from "lucide-react";

const TYPE_COLOR: Record<string, string> = {
  hackathon:   "bg-orange-500/20 text-orange-400",
  award:       "bg-yellow-500/20 text-yellow-400",
  internship:  "bg-blue-500/20 text-blue-400",
  competition: "bg-pink-500/20 text-pink-400",
  research:    "bg-purple-500/20 text-purple-400",
  other:       "bg-gray-500/20 text-gray-400",
};

export default function AchievementsView() {
  const [items, setItems] = useState<Achievement[]>([]);

  useEffect(() => {
    fetch("/api/achievements").then(r => r.json()).then(d => Array.isArray(d) && setItems(d));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-black text-text mb-1">Achievements</h1>
      <p className="text-muted text-sm mb-6">Milestones, awards, and recognition.</p>

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No achievements yet. Add one in the admin panel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a._id} className="card-hover bg-card border border-border rounded-xl p-5 hover:border-green/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Trophy size={18} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-bold text-text">{a.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${TYPE_COLOR[a.type]}`}>
                        {a.type}
                      </span>
                      {a.proofUrl && (
                        <a href={a.proofUrl} target="_blank" rel="noreferrer"
                          className="text-dim hover:text-green transition-colors">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                  {a.organization && <p className="text-muted text-xs mb-2">{a.organization}</p>}
                  {a.description && <p className="text-muted text-sm">{a.description}</p>}
                  {a.impact && (
                    <p className="text-green text-xs mt-2 font-mono">◆ {a.impact}</p>
                  )}
                  {a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {a.tags.map(t => (
                        <span key={t} className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-yellow-500/30 hover:text-yellow-400">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

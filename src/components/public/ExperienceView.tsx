"use client";
import { useEffect, useState } from "react";
import { Experience } from "@/types";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

function fmt(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ExperienceView() {
  const [items, setItems] = useState<Experience[]>([]);
  useEffect(() => {
    fetch("/api/experience").then(r => r.json()).then(d => Array.isArray(d) && setItems(d));
  }, []);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-black text-text mb-1">Experience</h1>
        <p className="text-muted text-sm mb-8">Roles, contributions, and learnings.</p>
      </motion.div>

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No experience yet. Add one in the admin panel.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Glowing vertical timeline line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-px pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, #1DB954 0%, #1DB95440 60%, transparent 100%)",
              boxShadow: "0 0 8px #1DB95460",
            }}
          />

          <div className="space-y-8 pl-12">
            {items.map((e, i) => (
              <motion.div
                key={e._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
                className="relative"
              >
                {/* Node dot on the timeline */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{ left: -49, top: 14, width: 38, height: 38 }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: e.current ? "#1DB954" : "#1DB95460",
                      background: e.current ? "#1DB95420" : "#121212",
                      boxShadow: e.current
                        ? "0 0 12px #1DB95470, 0 0 24px #1DB95430"
                        : "0 0 6px #1DB95430",
                    }}
                  >
                    {e.current && (
                      <div className="w-2 h-2 rounded-full bg-green animate-ping-slow" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-xl p-5 hover:border-green/30 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-border/50">
                      {e.logoUrl
                        ? <img src={e.logoUrl} alt={e.organization} className="w-8 h-8 rounded-lg object-cover" />
                        : <Briefcase size={18} className="text-blue-400" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-bold text-text group-hover:text-green transition-colors">{e.role}</h3>
                          <p className="text-muted text-sm">{e.organization}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-xs text-dim">
                            {fmt(e.startDate)} &mdash;{" "}
                            {e.current
                              ? <span className="text-green font-semibold">Present</span>
                              : fmt(e.endDate)
                            }
                          </p>
                          <span className="font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded capitalize mt-1 inline-block border border-border/50">
                            {e.type}
                          </span>
                        </div>
                      </div>

                      {e.description && (
                        <p className="text-muted text-sm mt-3 leading-relaxed">{e.description}</p>
                      )}

                      {e.impactMetrics.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {e.impactMetrics.map((m, idx) => (
                            <li key={idx} className="text-sm text-muted flex gap-2">
                              <span className="text-green flex-shrink-0">&#x25C6;</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      )}

                      {e.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {e.technologies.map(t => (
                            <span
                              key={t}
                              className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-green/30 hover:text-green transition-colors"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

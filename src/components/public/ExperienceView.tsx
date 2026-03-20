"use client";
import { useEffect, useState } from "react";
import { Experience } from "@/types";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

function fmt(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

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
        <p className="text-muted text-sm mb-6">Roles, contributions, and learnings.</p>
      </motion.div>

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No experience yet. Add one in the admin panel.</p>
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {items.map(e => (
            <motion.div
              key={e._id}
              variants={cardVariant}
              className="card-hover bg-card border border-border rounded-xl p-5 hover:border-green/30"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  {e.logoUrl
                    ? <img src={e.logoUrl} alt={e.organization} className="w-8 h-8 rounded-lg object-cover" />
                    : <Briefcase size={18} className="text-blue-400" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-text">{e.role}</h3>
                      <p className="text-muted text-sm">{e.organization}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs text-dim">
                        {fmt(e.startDate)} — {e.current ? <span className="text-green">Present</span> : fmt(e.endDate)}
                      </p>
                      <span className="font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded capitalize">{e.type}</span>
                    </div>
                  </div>
                  {e.description && <p className="text-muted text-sm mt-3">{e.description}</p>}
                  {e.impactMetrics.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {e.impactMetrics.map((m, i) => (
                        <li key={i} className="text-sm text-muted flex gap-2">
                          <span className="text-green">◆</span>{m}
                        </li>
                      ))}
                    </ul>
                  )}
                  {e.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {e.technologies.map(t => (
                        <span key={t} className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-green/30 hover:text-green">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

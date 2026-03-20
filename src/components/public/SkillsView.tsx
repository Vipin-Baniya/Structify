"use client";
import { useEffect, useState } from "react";
import { Skill } from "@/types";
import { motion } from "framer-motion";

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; mono: string; bar: string }> = {
  "ai-ml":       { label: "AI & Machine Learning", color: "text-purple-400", bg: "bg-purple-500/10",  mono: "◈", bar: "bg-purple-500" },
  "full-stack":  { label: "Full Stack",             color: "text-green",      bg: "bg-green/10",       mono: "⬡", bar: "bg-green" },
  "systems":     { label: "Systems & Embedded",     color: "text-orange-400", bg: "bg-orange-500/10",  mono: "◆", bar: "bg-orange-500" },
  "power":       { label: "Power Systems",          color: "text-yellow-400", bg: "bg-yellow-500/10",  mono: "⚡", bar: "bg-yellow-500" },
  "competitive": { label: "Competitive Programming",color: "text-blue-400",   bg: "bg-blue-500/10",    mono: "▲", bar: "bg-blue-500" },
  "tools":       { label: "Tools & DevOps",         color: "text-cyan-400",   bg: "bg-cyan-500/10",    mono: "⊞", bar: "bg-cyan-500" },
  "other":       { label: "Other",                  color: "text-muted",      bg: "bg-surface",        mono: "◌", bar: "bg-muted" },
};

function ProficiencyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`block w-1.5 h-1.5 rounded-full ${i <= level ? "bg-green" : "bg-border"}`} />
      ))}
    </div>
  );
}

function TechRadar({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const categories = Object.entries(grouped).filter(([, arr]) => arr.length > 0);
  if (categories.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-8">
      <p className="font-mono text-[10px] text-muted mb-4">{"// TECH RADAR — avg. proficiency by domain"}</p>
      <div className="space-y-3">
        {categories.map(([cat, arr]) => {
          const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
          const avg  = arr.reduce((s, x) => s + x.proficiency, 0) / arr.length;
          const pct  = (avg / 5) * 100;
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className={`font-mono text-[10px] w-40 shrink-0 ${meta.color}`}>{meta.label}</span>
              <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${meta.bar} opacity-70`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-dim w-8 text-right">{avg.toFixed(1)}</span>
              <span className="font-mono text-[10px] text-dim w-12 text-right">{arr.length} skills</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function SkillsView() {
  const [skills,  setSkills]  = useState<Skill[]>([]);
  const [active,  setActive]  = useState("all");
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState<"cards" | "radar">("cards");

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSkills(d); })
      .finally(() => setLoading(false));
  }, []);

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const categories = Object.keys(grouped);
  const filtered   = active === "all" ? grouped : { [active]: grouped[active] ?? [] };

  return (
    <div>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-1"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-black text-text">Skills</h1>
        {/* View toggle */}
        {!loading && skills.length > 0 && (
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            <button onClick={() => setView("cards")}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${view === "cards" ? "bg-green/20 text-green" : "text-muted hover:text-text"}`}>
              Cards
            </button>
            <button onClick={() => setView("radar")}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${view === "radar" ? "bg-green/20 text-green" : "text-muted hover:text-text"}`}>
              Radar
            </button>
          </div>
        )}
      </motion.div>
      <motion.p
        className="text-muted text-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Technologies, tools, and domains I work in.
      </motion.p>

      {/* Tech radar view */}
      {view === "radar" && !loading && <TechRadar skills={skills} />}

      {/* Category filter pills */}
      {view === "cards" && !loading && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActive("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors
              ${active === "all" ? "bg-green text-bg font-bold" : "bg-card border border-border text-muted hover:text-text"}`}>
            All
          </button>
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
            return (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors
                  ${active === cat ? `${meta.bg} ${meta.color} border border-current/30 font-bold` : "bg-card border border-border text-muted hover:text-text"}`}>
                {meta.mono} {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-40" />)}
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No skills yet. Add some in the admin panel.</p>
        </div>
      ) : view === "cards" ? (
        <div className="space-y-8">
          {Object.entries(filtered).map(([cat, catSkills]) => {
            const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
            if (!catSkills.length) return null;
            return (
              <section key={cat}>
                <motion.div
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={`font-mono text-lg ${meta.color}`}>{meta.mono}</span>
                  <h2 className="text-base font-bold text-text">{meta.label}</h2>
                  <span className="font-mono text-[10px] text-dim">{catSkills.length} skill{catSkills.length !== 1 ? "s" : ""}</span>
                </motion.div>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {catSkills.map(skill => (
                    <motion.div
                      key={skill._id}
                      variants={cardVariant}
                      className="card-hover bg-card border border-border rounded-xl p-3 hover:border-green/30 group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {skill.iconUrl ? (
                            <img src={skill.iconUrl} alt={skill.name} className="w-5 h-5 rounded object-contain flex-shrink-0" />
                          ) : (
                            <span className={`font-mono text-sm flex-shrink-0 ${meta.color}`}>{meta.mono}</span>
                          )}
                          <span className="font-semibold text-text text-sm truncate group-hover:text-green transition-colors">{skill.name}</span>
                        </div>
                      </div>
                      <ProficiencyDots level={skill.proficiency} />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Radar view with per-skill bars */
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catSkills]) => {
            const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-mono text-sm ${meta.color}`}>{meta.mono}</span>
                  <h2 className="text-sm font-bold text-text">{meta.label}</h2>
                </div>
                <div className="space-y-2">
                  {catSkills.map(skill => (
                    <div key={skill._id} className="flex items-center gap-3">
                      {skill.iconUrl
                        ? <img src={skill.iconUrl} alt={skill.name} className="w-4 h-4 object-contain rounded flex-shrink-0" />
                        : <span className={`font-mono text-[10px] flex-shrink-0 w-4 text-center ${meta.color}`}>{meta.mono}</span>
                      }
                      <span className="text-sm text-text w-36 shrink-0 truncate">{skill.name}</span>
                      <div className="flex-1 bg-surface rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${meta.bar} opacity-70`}
                          style={{ width: `${(skill.proficiency / 5) * 100}%` }} />
                      </div>
                      <ProficiencyDots level={skill.proficiency} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {!loading && skills.length > 0 && view === "cards" && (
        <div className="mt-10 pt-6 border-t border-border flex items-center gap-4 flex-wrap">
          <span className="font-mono text-[10px] text-dim">Proficiency:</span>
          {([[1,"Beginner"],[3,"Intermediate"],[5,"Expert"]] as [number,string][]).map(([level, label]) => (
            <div key={label} className="flex items-center gap-2">
              <ProficiencyDots level={level} />
              <span className="font-mono text-[10px] text-dim">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

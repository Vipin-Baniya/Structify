"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/components/layout/PublicLayout";

interface PhilosophyEntry { title: string; description: string; }
interface ProfileData { name: string; tagline: string; bio: string; avatarUrl: string; }

const TIMELINE = [
  { year: "2023", label: "Started B.Tech", desc: "Enrolled in Computer Science — curiosity became the compass." },
  { year: "2024", label: "DSA + Open Source", desc: "Solved 300+ LeetCode problems, contributed to open-source repos." },
  { year: "2025", label: "Built AI Projects", desc: "Shipped full-stack AI products — RAG pipelines, LLM integrations, real users." },
  { year: "2026", label: "Building UrjaRakshak", desc: "IoT + ML energy management platform. Making an impact at scale." },
];

const revealUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AboutPage() {
  const [profile, setProfile]       = useState<ProfileData | null>(null);
  const [philosophy, setPhilosophy] = useState<PhilosophyEntry[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setProfile(d);
          setPhilosophy(Array.isArray(d.philosophy) ? d.philosophy : []);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <PublicLayout active="about">
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <motion.div {...revealUp}>
          <h1 className="text-3xl font-black text-text mb-1">About</h1>
          <p className="text-muted text-sm">
            {profile?.tagline ?? "The architect behind Structify."}
          </p>
        </motion.div>

        {/* Narrative arc */}
        <motion.div
          {...revealUp}
          className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-2xl p-6"
        >
          <p className="font-mono text-[10px] text-green mb-3">{"// ORIGIN STORY"}</p>
          <p className="text-text text-sm leading-relaxed">
            Started with{" "}
            <span className="text-green font-semibold">curiosity</span> — a kid who wanted to know
            how things worked under the hood. That curiosity turned into code, code turned into
            projects, and projects turned into{" "}
            <span className="text-green font-semibold">AI ecosystems</span> that solve real problems.
          </p>
        </motion.div>

        {/* Who I am */}
        <motion.div
          {...revealUp}
          className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-2xl p-6"
        >
          <p className="font-mono text-[10px] text-muted mb-4">{"// WHO I AM"}</p>
          {profile ? (
            <div className="flex items-start gap-4">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border border-white/10"
                />
              )}
              <p className="text-text text-sm leading-relaxed">
                {"I'm "}
                <strong className="text-green">{profile.name}</strong>
                {" — "}
                {profile.bio}
              </p>
            </div>
          ) : (
            <div className="h-12 bg-surface rounded-xl animate-pulse" />
          )}
        </motion.div>

        {/* Timeline */}
        <motion.div {...revealUp}>
          <p className="font-mono text-[10px] text-muted mb-5">{"// JOURNEY"}</p>
          <div className="relative">
            {/* Vertical glowing line */}
            <div
              className="absolute left-[19px] top-2 bottom-2 w-px pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, #1DB954 0%, #1DB95440 60%, transparent 100%)",
                boxShadow: "0 0 8px #1DB95460",
              }}
            />
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                  className="flex gap-5 items-start"
                >
                  {/* Node */}
                  <div className="relative flex-shrink-0 mt-1" style={{ width: 38, height: 38 }}>
                    <div
                      className="w-10 h-10 rounded-full bg-green/10 border border-green/40 flex items-center justify-center z-10 relative"
                      style={{ boxShadow: "0 0 12px #1DB95430" }}
                    >
                      <span className="font-mono text-[9px] font-black text-green">{item.year}</span>
                    </div>
                  </div>
                  {/* Card */}
                  <div className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-xl p-4 flex-1 hover:border-green/20 transition-colors">
                    <p className="font-bold text-text text-sm mb-1">{item.label}</p>
                    <p className="text-muted text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Philosophy */}
        {philosophy.length > 0 && (
          <motion.div
            {...revealUp}
            className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-2xl p-6"
          >
            <p className="font-mono text-[10px] text-muted mb-4">{"// PHILOSOPHY"}</p>
            {philosophy.map((p, i) => (
              <div key={i} className="flex gap-3 mb-4 last:mb-0">
                <span className="text-green text-sm flex-shrink-0 mt-0.5">&#x25C6;</span>
                <div>
                  <p className="font-semibold text-text text-sm">{p.title}</p>
                  <p className="text-muted text-xs mt-0.5">{p.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </PublicLayout>
  );
}

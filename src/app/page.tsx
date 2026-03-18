"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const TYPING_WORDS = [
  "Take Shape.",
  "Scale Up.",
  "Come Alive.",
  "Tell Stories.",
  "Stand Out.",
];

const FLOATING_ORBS = [
  { size: 320, top: "10%",  left: "5%",   delay: "0s",    opacity: 0.04 },
  { size: 200, top: "60%",  right: "8%",  delay: "2s",    opacity: 0.06 },
  { size: 140, top: "30%",  right: "20%", delay: "1s",    opacity: 0.05 },
  { size: 100, top: "75%",  left: "15%",  delay: "1.5s",  opacity: 0.04 },
];

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = TYPING_WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(i => i + 1), 65);
    } else if (!isDeleting && charIndex === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(i => i - 1), 35);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setWordIndex(i => (i + 1) % TYPING_WORDS.length);
    }

    setDisplayed(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1ED76006 1px, transparent 1px), linear-gradient(90deg, #1ED76006 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Radial glow — centre */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "44%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800, height: 800,
          background: "radial-gradient(circle, #1ED76010 0%, transparent 62%)",
        }}
      />

      {/* Floating blurred orbs */}
      {FLOATING_ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full animate-float"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: (orb as { left?: string }).left,
            right: (orb as { right?: string }).right,
            background: `radial-gradient(circle, #1ED760 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: "blur(60px)",
            animationDelay: orb.delay,
          }}
        />
      ))}

      {/* Subtle corner code fragments */}
      <div className="absolute top-8 right-8 text-[10px] font-mono text-green/10 pointer-events-none hidden lg:block select-none leading-relaxed text-right">
        <p>{"const engineer = {"}</p>
        <p>&nbsp;&nbsp;{"name: \"Vipin\","}</p>
        <p>&nbsp;&nbsp;{"stack: [\"React\", \"Node\", \"ML\"],"}</p>
        <p>&nbsp;&nbsp;{"open: true,"}</p>
        <p>{"}"}</p>
      </div>
      <div className="absolute bottom-16 left-8 text-[10px] font-mono text-green/10 pointer-events-none hidden lg:block select-none leading-relaxed">
        <p>$ structify init portfolio</p>
        <p className="text-green/15">✓ systems initialized</p>
        <p className="text-green/15">✓ identity deployed</p>
      </div>

      {/* Main hero content */}
      <div className="relative text-center max-w-2xl px-6">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green/20 bg-green/5 mb-8 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-ping-slow" />
          <span className="text-green font-mono text-[11px] tracking-[0.3em]">◈ STRUCTIFY · LIVE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-text leading-[1.06] tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Where Systems<br />
          <span className="text-green relative">
            {displayed}
            <span className="typing-cursor" />
          </span>
        </h1>

        <p className="text-muted text-base leading-relaxed mb-10 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Engineering identity platform — projects, live code,
          achievements, OS themes, and dynamic architecture.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-3 justify-center flex-wrap animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/home"
            className="group px-8 py-3.5 rounded-full bg-green text-bg font-mono font-bold text-sm
                       hover:scale-105 hover:shadow-[0_0_40px_#1ED76050] transition-all duration-200 relative overflow-hidden"
          >
            <span className="relative z-10">▶ Explore Platform</span>
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/admin/login"
            className="px-8 py-3.5 rounded-full border border-border text-text font-mono font-semibold text-sm
                       hover:border-green/40 hover:bg-green/5 hover:scale-105 transition-all duration-200"
          >
            ⬡ Admin Login
          </Link>
        </div>

        {/* Mini stats row */}
        <div className="mt-14 flex items-center justify-center gap-8 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          {[
            { value: "OS Themes", label: "macOS · Win · Linux · Android · iOS" },
            { value: "Full CMS",  label: "Dynamic admin panel" },
            { value: "Live Code", label: "GitHub explorer built-in" },
          ].map(({ value, label }) => (
            <div key={value} className="text-center">
              <p className="text-green font-mono font-bold text-sm">{value}</p>
              <p className="text-dim font-mono text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-border font-mono">v1.0.0 · Structify</p>
      </div>
    </main>
  );
}

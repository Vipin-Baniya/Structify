"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FLOATING_ORBS = [
  { size: 380, top: "10%",  left: "5%",   delay: 0,    opacity: 0.05 },
  { size: 260, top: "60%",  right: "8%",  delay: 2,    opacity: 0.07 },
  { size: 180, top: "30%",  right: "20%", delay: 1,    opacity: 0.05 },
  { size: 120, top: "75%",  left: "15%",  delay: 1.5,  opacity: 0.04 },
  { size: 200, top: "20%",  left: "45%",  delay: 3,    opacity: 0.03 },
];

const TYPING_LINES = [
  "Hey stranger…",
  "I didn't expect you here.",
  "But now that you are—",
  "get ready to be impressed.",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
});

function TypingText() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const line = TYPING_LINES[lineIndex];
    if (charIndex < line.length) {
      const t = setTimeout(() => setCharIndex(c => c + 1), 38);
      return () => clearTimeout(t);
    }
    if (lineIndex < TYPING_LINES.length - 1) {
      const t = setTimeout(() => { setLineIndex(l => l + 1); setCharIndex(0); }, 520);
      return () => clearTimeout(t);
    }
    setDone(true);
  }, [charIndex, lineIndex, done]);

  return (
    <div className="text-left max-w-lg mx-auto mb-8 space-y-1">
      {TYPING_LINES.map((line, i) => (
        <p
          key={i}
          className={`font-display font-bold leading-snug transition-all duration-300
            ${i === 0 ? "text-3xl md:text-4xl text-green" : "text-2xl md:text-3xl text-text"}
            ${i > lineIndex ? "opacity-0" : "opacity-100"}`}
        >
          {i < lineIndex ? line : i === lineIndex ? line.slice(0, charIndex) : ""}
          {i === lineIndex && !done && <span className="typing-cursor" />}
        </p>
      ))}
    </div>
  );
}

function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-75"
      style={{
        width: 420,
        height: 420,
        background: "radial-gradient(circle, #1DB95418 0%, transparent 65%)",
        borderRadius: "50%",
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      <MouseGlow />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1DB95406 1px, transparent 1px), linear-gradient(90deg, #1DB95406 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Radial glow — centre */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "44%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 900, height: 900,
          background: "radial-gradient(circle, #1DB95412 0%, transparent 60%)",
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
            background: i % 2 === 0
              ? `radial-gradient(circle, #1DB954 0%, transparent 70%)`
              : `radial-gradient(circle, #8B5CF6 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: "blur(70px)",
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      {/* Corner code fragments */}
      <div className="absolute top-8 right-8 text-[10px] font-mono text-green/10 pointer-events-none hidden lg:block select-none leading-relaxed text-right">
        <p>{"const engineer = {"}</p>
        <p>&nbsp;&nbsp;{"name: \"Vipin\","}</p>
        <p>&nbsp;&nbsp;{"stack: [\"React\", \"Node\", \"ML\"],"}</p>
        <p>&nbsp;&nbsp;{"open: true,"}</p>
        <p>{"}"}</p>
      </div>
      <div className="absolute bottom-16 left-8 text-[10px] font-mono text-green/10 pointer-events-none hidden lg:block select-none leading-relaxed">
        <p>$ structify init portfolio</p>
        <p className="text-green/15">✓ identity deployed</p>
        <p className="text-green/15">✓ systems live</p>
      </div>

      {/* Main hero content */}
      <div className="relative text-center max-w-2xl px-6">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green/20 bg-green/5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-ping-slow" />
          <span className="text-green font-mono text-[11px] tracking-[0.3em]">◈ AVAILABLE FOR WORK</span>
        </motion.div>

        {/* Typing hero text */}
        <motion.div {...fadeUp(0.15)}>
          <TypingText />
        </motion.div>

        {/* Name subtitle */}
        <motion.p
          {...fadeUp(0.3)}
          className="text-muted text-sm leading-relaxed mb-8 max-w-md mx-auto"
        >
          Built by{" "}
          <span className="text-green font-semibold">Vipin Baniya</span>
          {" "}— engineer · AI researcher · systems architect.
        </motion.p>

        {/* Scroll hint */}
        <motion.p
          {...fadeUp(0.4)}
          className="text-dim/60 text-xs font-mono mb-10 flex items-center justify-center gap-2"
        >
          Scroll to explore the full story
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.5)} className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/home"
            className="group px-8 py-3.5 rounded-full bg-green text-bg font-mono font-bold text-sm
                       hover:scale-105 hover:shadow-[0_0_48px_#1DB95460] transition-all duration-200 relative overflow-hidden"
          >
            <span className="relative z-10">▶ Explore My World</span>
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/admin/login"
            className="px-8 py-3.5 rounded-full border border-border text-text font-mono font-semibold text-sm
                       hover:border-green/40 hover:bg-green/5 hover:scale-105 transition-all duration-200"
          >
            ⬡ Admin Login
          </Link>
        </motion.div>

        <motion.p {...fadeUp(0.6)} className="mt-10 text-xs text-border font-mono">
          v1.0.0 · Vipin Baniya - Portfolio
        </motion.p>
      </div>
    </main>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const FLOATING_ORBS = [
  { size: 320, top: "10%",  left: "5%",   delay: 0,    opacity: 0.04 },
  { size: 200, top: "60%",  right: "8%",  delay: 2,    opacity: 0.06 },
  { size: 140, top: "30%",  right: "20%", delay: 1,    opacity: 0.05 },
  { size: 100, top: "75%",  left: "15%",  delay: 1.5,  opacity: 0.04 },
];

const TYPING_PHRASES = [
  "Hey stranger\u2026",
  "I didn't expect you here.",
  "But now that you are\u2014",
  "get ready to be impressed.",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
});

function useMousePosition() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

export default function LandingPage() {
  const mouse = useMousePosition();
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex]     = useState(0);
  const [pausing, setPausing]         = useState(false);

  const advanceTyping = useCallback(() => {
    const phrase = TYPING_PHRASES[phraseIndex];
    if (pausing) {
      setPausing(false);
      setDisplayText("");
      setCharIndex(0);
      setPhraseIndex(i => (i + 1) % TYPING_PHRASES.length);
      return;
    }
    if (charIndex < phrase.length) {
      setDisplayText(phrase.slice(0, charIndex + 1));
      setCharIndex(c => c + 1);
    } else {
      setPausing(true);
    }
  }, [phraseIndex, charIndex, pausing]);

  useEffect(() => {
    const delay = pausing ? 1800 : 48;
    const id = setTimeout(advanceTyping, delay);
    return () => clearTimeout(id);
  }, [advanceTyping, pausing]);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Mouse-follow glow */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, color-mix(in srgb, var(--accent) 8%, transparent), transparent 50%)`,
          transition: "background 0.1s ease",
        }}
      />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--accent)05 1px, transparent 1px), linear-gradient(90deg, var(--accent)05 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Radial glow — centre */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "44%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 700, height: 700,
          background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 65%)",
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
            background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: "blur(60px)",
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
        <p className="text-green/15">&#x2713; identity deployed</p>
        <p className="text-green/15">&#x2713; systems live</p>
      </div>

      {/* Main hero content */}
      <div className="relative text-center max-w-2xl px-6" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green/20 bg-green/5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-ping-slow" />
          <span className="font-mono text-xs tracking-[0.35em] opacity-80" style={{ color: "var(--accent)" }}>&#x25C8; VIPIN BANIYA</span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-7xl font-black text-text leading-[1.06] tracking-tight mb-6"
        >
          Vipin Baniya
        </motion.h1>

        {/* Typing animation tagline */}
        <motion.div
          {...fadeUp(0.2)}
          className="text-muted text-base leading-relaxed mb-3 max-w-md mx-auto min-h-[2rem] flex items-center justify-center"
        >
          <span className="font-mono">
            {displayText}
            <span className="inline-block w-[2px] h-[1em] bg-green ml-0.5 align-middle animate-pulse" />
          </span>
        </motion.div>

        <motion.p
          {...fadeUp(0.3)}
          className="text-muted/70 text-sm font-semibold mb-10 tracking-wide"
        >
          Engineer by degree.{" "}
          <span className="bg-gradient-to-r from-green to-green/60 bg-clip-text text-transparent">
            Builder by obsession.
          </span>
        </motion.p>

        <motion.div {...fadeUp(0.4)} className="flex gap-3 justify-center flex-wrap">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/home"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-mono font-bold text-sm
                         transition-all duration-200 relative overflow-hidden"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                boxShadow: "0 0 0px var(--accent)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 50px color-mix(in srgb, var(--accent) 40%, transparent)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0px var(--accent)")}
            >
              <span className="relative z-10">&#x25B6; Explore Portfolio</span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-border text-text font-mono font-semibold text-sm
                         hover:border-green/40 hover:bg-green/5 transition-all duration-200"
            >
              &#x2709; Contact
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          {...fadeUp(0.5)}
          className="mt-8 text-dim/50 text-xs font-mono flex items-center justify-center gap-2"
        >
          Start exploring &mdash; there&apos;s more than what meets the eye.
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            &#x2193;
          </motion.span>
        </motion.p>

        <motion.p {...fadeUp(0.6)} className="mt-8 text-xs text-border font-mono">
          vipinbaniya.dev
        </motion.p>
      </div>
    </main>
  );
}

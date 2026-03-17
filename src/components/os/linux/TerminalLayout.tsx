"use client";
import { usePathname, useRouter } from "next/navigation";
import Link   from "next/link";
import { useState, useEffect, useRef } from "react";
import PlayerBar           from "@/components/layout/PlayerBar";
import { PlayerProvider }  from "@/components/ui/PlayerContext";
import { CommandPalette }  from "@/components/core/CommandPalette";
import { OSThemeSwitcher } from "@/components/core/OSThemeSwitcher";

const NAV_ITEMS = [
  { href: "/home",         cmd: "home",         label: "Home",         desc: "Portfolio landing page" },
  { href: "/projects",     cmd: "projects",     label: "Projects",     desc: "View all projects" },
  { href: "/skills",       cmd: "skills",       label: "Skills",       desc: "Technical skills" },
  { href: "/blog",         cmd: "blog",         label: "Notes",        desc: "Writing and notes" },
  { href: "/achievements", cmd: "achievements", label: "Achievements", desc: "Awards and recognitions" },
  { href: "/certificates", cmd: "certificates", label: "Certificates", desc: "Certifications" },
  { href: "/experience",   cmd: "experience",   label: "Experience",   desc: "Work experience" },
  { href: "/testimonials", cmd: "testimonials", label: "Testimonials", desc: "What people say" },
  { href: "/about",        cmd: "about",        label: "About",        desc: "About Vipin" },
  { href: "/contact",      cmd: "contact",      label: "Contact",      desc: "Get in touch" },
];

export default function TerminalLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?:  string;
}) {
  const pathname  = usePathname();
  const router    = useRouter();

  const currentCmd = NAV_ITEMS.find(n => pathname.startsWith(n.href))?.cmd ?? "home";

  const [input,   setInput]   = useState("");
  const [history, setHistory] = useState<string[]>([
    "Welcome to Vipin's Portfolio Terminal — type `help` for commands.",
    `$ cd /${currentCmd}`,
  ]);
  const [histIdx,  setHistIdx] = useState(-1);
  const [cmdhist,  setCmdhist] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  function runCommand(raw: string) {
    const cmd  = raw.trim().toLowerCase();
    const log  = (msg: string) => setHistory(h => [...h, msg]);
    log(`vipin@portfolio:~$ ${raw}`);

    if (cmd === "help" || cmd === "?") {
      log("Available commands:");
      NAV_ITEMS.forEach(n => log(`  ${n.cmd.padEnd(14)} — ${n.desc}`));
      log("  clear          — clear the terminal");
      log("  theme          — switch OS theme");
      log("  search <query> — search portfolio");
      return;
    }
    if (cmd === "clear") { setHistory([]); return; }
    if (cmd === "ls" || cmd === "ls projects") {
      router.push("/projects"); log("Opening projects…"); return;
    }
    if (cmd.startsWith("search ")) {
      const q = raw.slice(7).trim();
      router.push(`/search?q=${encodeURIComponent(q)}`);
      log(`Searching for "${q}"…`);
      return;
    }
    const found = NAV_ITEMS.find(n => n.cmd === cmd || n.label.toLowerCase() === cmd);
    if (found) { router.push(found.href); log(`Opening ${found.label}…`); return; }
    if (cmd.startsWith("open ")) {
      const target = NAV_ITEMS.find(n => n.cmd === cmd.slice(5).trim());
      if (target) { router.push(target.href); log(`Opening ${target.label}…`); return; }
    }
    log(`bash: ${raw}: command not found — try 'help'`);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const val = input.trim();
      if (val) { setCmdhist(h => [val, ...h]); runCommand(val); }
      setInput(""); setHistIdx(-1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdhist.length - 1);
      setHistIdx(next);
      if (cmdhist[next] !== undefined) setInput(cmdhist[next]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : (cmdhist[next] ?? ""));
    }
  }

  return (
    <PlayerProvider>
      <CommandPalette />

      <div
        className="flex flex-col h-screen font-mono"
        style={{ background: "#0d0d0d", color: "#00ff00" }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal title bar */}
        <div
          className="shrink-0 h-7 flex items-center px-3 gap-2 text-xs"
          style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}
        >
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 text-center text-[#888]">vipin@portfolio: ~/{currentCmd}</span>
          <OSThemeSwitcher />
        </div>

        {/* Split: terminal left, content right */}
        <div className="flex flex-1 overflow-hidden">

          {/* Terminal pane */}
          <div
            className="hidden md:flex flex-col w-64 shrink-0 overflow-y-auto"
            style={{ background: "#0d0d0d", borderRight: "1px solid #1f1f1f" }}
          >
            {/* Nav as ls output */}
            <div className="p-3 text-[11px] space-y-0.5">
              <p className="text-[#555] mb-2">vipin@portfolio:~$ ls /sections</p>
              {NAV_ITEMS.map(({ href, cmd, label }) => {
                const on = pathname.startsWith(href) || active === label.toLowerCase();
                return (
                  <Link key={href} href={href}
                    className="flex items-center gap-2 px-1 py-0.5 rounded transition-colors hover:bg-[#1a1a1a]"
                    style={{ color: on ? "#00ff00" : "#4ade80" }}
                  >
                    {on ? "▶ " : "  "}{cmd}/
                  </Link>
                );
              })}
            </div>

            {/* Interactive input */}
            <div className="flex-1" />
            <div
              className="border-t p-2"
              style={{ borderColor: "#1f1f1f" }}
            >
              <div className="max-h-28 overflow-y-auto text-[10px] space-y-0.5 mb-1 text-[#4ade80]">
                {history.slice(-6).map((line, i) => <p key={i}>{line}</p>)}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[#00ff00]">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  className="flex-1 bg-transparent outline-none text-[#00ff00] caret-[#00ff00]"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Content area */}
          <main
            className="flex-1 overflow-y-auto p-6"
            style={{ background: "#0f0f0f" }}
          >
            {/* Breadcrumb */}
            <p className="text-[11px] mb-4" style={{ color: "#555" }}>
              vipin@portfolio:~/{currentCmd}$
            </p>
            {children}
          </main>
        </div>
      </div>

      <PlayerBar />
    </PlayerProvider>
  );
}

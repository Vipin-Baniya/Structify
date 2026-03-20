"use client";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

interface ContactLink { label: string; href: string; icon: string; color: string; }

const inputCls =
  "w-full bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-xl px-4 py-3 text-text text-sm placeholder:text-dim/50 outline-none transition-all duration-200 focus:border-green/60 focus:shadow-[0_0_0_3px_#1DB95420] font-mono";

export default function ContactPage() {
  const [links, setLinks]         = useState<ContactLink[]>([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [sent, setSent]           = useState(false);
  const [form, setForm]           = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setLinks(Array.isArray(d.links) ? d.links : []);
          setResumeUrl(d.resumeUrl ?? "");
        }
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <PublicLayout active="contact">
      <div className="max-w-lg space-y-8">
        <div>
          <h1 className="text-3xl font-black text-text mb-1">Contact</h1>
          <p className="text-muted text-sm">{"Let's build something together."}</p>
        </div>

        {/* Social links */}
        {links.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-green/20 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                  style={{ background: l.color + "15", borderColor: l.color + "30", color: l.color }}
                >
                  {l.icon}
                </div>
                <div>
                  <p className="font-semibold text-text text-sm group-hover:text-green transition-colors">{l.label}</p>
                  <p className="font-mono text-[10px] text-muted">&#x2197; Open</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Download resume */}
        {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 border border-green/30 text-green rounded-xl hover:bg-green/5 transition-colors font-mono text-sm"
          >
            &#x2193; Download Resume
          </a>
        )}

        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-2xl p-6"
        >
          <p className="font-mono text-[10px] text-green mb-5">{"// SEND A MESSAGE"}</p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <CheckCircle size={32} className="text-green" />
              <p className="text-text font-semibold">Message received!</p>
              <p className="text-muted text-sm">{"I'll get back to you soon."}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-muted mb-1.5">NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-muted mb-1.5">EMAIL</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-muted mb-1.5">MESSAGE</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What's on your mind?"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-green text-bg rounded-xl font-mono font-bold text-sm hover:shadow-[0_0_24px_#1DB95450] hover:scale-[1.02] transition-all duration-200"
              >
                <Send size={14} />
                Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </PublicLayout>
  );
}

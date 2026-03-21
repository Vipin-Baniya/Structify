"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload, RefreshCw } from "lucide-react";
import { Field, Input, Textarea, FormActions } from "@/components/admin/FormFields";

interface PhilosophyEntry { title: string; description: string; }
interface ContactLink     { label: string; href: string; icon: string; color: string; }
interface LiveDashboard   {
  leetcode: number; gfgScore: number; githubCommits: number;
  leetcodeUrl: string; gfgUrl: string; githubUrl: string;
}
interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  resumeUrl: string;
  philosophy: PhilosophyEntry[];
  links: ContactLink[];
  liveDashboard: LiveDashboard;
}

const DEFAULT_PROFILE: ProfileData = {
  name: "", tagline: "", bio: "", avatarUrl: "", resumeUrl: "",
  philosophy: [], links: [],
  liveDashboard: { leetcode: 0, gfgScore: 0, githubCommits: 0, leetcodeUrl: "", gfgUrl: "", githubUrl: "" },
};

export default function AdminProfilePage() {
  const [data, setData]           = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [syncMsg, setSyncMsg]     = useState<string | null>(null);
  const resumeFileRef             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setData({
            ...DEFAULT_PROFILE,
            ...d,
            liveDashboard: { ...DEFAULT_PROFILE.liveDashboard, ...(d.liveDashboard ?? {}) },
          });
        }
      })
      .catch(() => {});
  }, []);

  function setField(key: keyof ProfileData, value: unknown) {
    setData(d => ({ ...d, [key]: value }));
  }

  // ── Philosophy helpers ──────────────────────────────────────────
  function addPhilosophy() {
    setData(d => ({ ...d, philosophy: [...d.philosophy, { title: "", description: "" }] }));
  }
  function setPhilosophy(i: number, key: keyof PhilosophyEntry, val: string) {
    setData(d => {
      const next = [...d.philosophy];
      next[i] = { ...next[i], [key]: val };
      return { ...d, philosophy: next };
    });
  }
  function removePhilosophy(i: number) {
    setData(d => ({ ...d, philosophy: d.philosophy.filter((_, idx) => idx !== i) }));
  }
  function movePhilosophy(i: number, dir: -1 | 1) {
    setData(d => {
      const next = [...d.philosophy];
      const j = i + dir;
      if (j < 0 || j >= next.length) return d;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, philosophy: next };
    });
  }

  // ── Link helpers ────────────────────────────────────────────────
  function addLink() {
    setData(d => ({ ...d, links: [...d.links, { label: "", href: "", icon: "◌", color: "#EAEAEA" }] }));
  }
  function setLink(i: number, key: keyof ContactLink, val: string) {
    setData(d => {
      const next = [...d.links];
      next[i] = { ...next[i], [key]: val };
      return { ...d, links: next };
    });
  }
  function removeLink(i: number) {
    setData(d => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }));
  }

  // ── Live Dashboard helpers ───────────────────────────────────────
  function setDashboard(key: keyof LiveDashboard, val: string) {
    if (key === "leetcodeUrl" || key === "gfgUrl" || key === "githubUrl") {
      setData(d => ({ ...d, liveDashboard: { ...d.liveDashboard, [key]: val } }));
      return;
    }
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num)) return;
    setData(d => ({ ...d, liveDashboard: { ...d.liveDashboard, [key]: num } }));
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("pdf")) {
      alert("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const base64 = ev.target?.result as string;
      try {
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, folder: "structify/resumes" }),
        });
        const d = await r.json();
        if (d.url) setData(prev => ({ ...prev, resumeUrl: d.url }));
        else alert("Upload failed. Check Cloudinary config.");
      } catch {
        alert("Upload failed.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/profile/sync", { method: "POST" });
      const d = await res.json();
      if (res.ok) {
        if (d.liveDashboard) {
          setData(prev => ({
            ...prev,
            liveDashboard: { ...prev.liveDashboard, ...d.liveDashboard },
          }));
        }
        const warn = d.errors?.length ? ` (${d.errors.join(", ")})` : "";
        setSyncMsg(`✓ Stats synced${warn}`);
      } else {
        setSyncMsg(`✗ ${d.error || "Sync failed"}`);
      }
    } catch {
      setSyncMsg("✗ Sync request failed");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 5000);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated && !updated.error) {
          setData(prev => ({
            ...prev,
            ...updated,
            liveDashboard: { ...prev.liveDashboard, ...(updated.liveDashboard ?? {}) },
          }));
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        alert(`Failed to save: ${body.error || res.statusText}`);
      }
    } catch {
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-text">Profile</h1>
          <p className="text-muted text-sm">About page &amp; contact links</p>
        </div>
        {saved && (
          <span className="font-mono text-xs text-green flex items-center gap-1">
            ✓ Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Basic Info ─────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <p className="font-mono text-[10px] text-muted">{"// BASIC INFO"}</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Your Name">
              <Input value={data.name} onChange={v => setField("name", v)} placeholder="Vipin Baniya" />
            </Field>
            <Field label="Tagline" hint="Shown under the About heading">
              <Input value={data.tagline} onChange={v => setField("tagline", v)} placeholder="The architect behind Structify." />
            </Field>
          </div>

          <Field label="Bio" hint="Main paragraph on the About page">
            <Textarea value={data.bio} onChange={v => setField("bio", v)} rows={3}
              placeholder="A systems engineer and AI researcher..." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Avatar URL" hint="Optional profile photo">
              <Input value={data.avatarUrl} onChange={v => setField("avatarUrl", v)} placeholder="https://..." />
            </Field>
            <Field label="Resume PDF" hint="Upload to Cloudinary or paste any public URL">
              <input ref={resumeFileRef} type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" />
              <div className="flex gap-2">
                <button type="button" onClick={() => resumeFileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-xs text-muted hover:text-text disabled:opacity-60 transition-colors shrink-0">
                  <Upload size={12} /> {uploading ? "Uploading..." : "Upload PDF"}
                </button>
                <input
                  value={data.resumeUrl}
                  onChange={e => setData(d => ({ ...d, resumeUrl: e.target.value }))}
                  placeholder="or paste URL — https://..."
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-green/40 transition-colors"
                />
              </div>
              {data.resumeUrl && (
                <p className="text-[10px] text-green mt-1 font-mono truncate">✓ {data.resumeUrl}</p>
              )}
            </Field>
          </div>
        </section>

        {/* ── Philosophy ─────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted">{"// PHILOSOPHY"}</p>
            <button type="button" onClick={addPhilosophy}
              className="flex items-center gap-1.5 text-xs text-green hover:opacity-80 font-mono transition-opacity">
              <Plus size={12} /> Add entry
            </button>
          </div>

          {data.philosophy.length === 0 && (
            <p className="text-dim text-xs">No philosophy entries yet. Click &quot;Add entry&quot; to start.</p>
          )}

          {data.philosophy.map((p, i) => (
            <div key={i} className="flex gap-3 items-start bg-surface border border-border rounded-lg p-3">
              {/* reorder */}
              <div className="flex flex-col gap-0.5 pt-1">
                <button type="button" onClick={() => movePhilosophy(i, -1)}
                  disabled={i === 0}
                  className="text-dim hover:text-text disabled:opacity-20 transition-colors leading-none text-[10px]">▲</button>
                <button type="button" onClick={() => movePhilosophy(i, 1)}
                  disabled={i === data.philosophy.length - 1}
                  className="text-dim hover:text-text disabled:opacity-20 transition-colors leading-none text-[10px]">▼</button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  value={p.title}
                  onChange={e => setPhilosophy(i, "title", e.target.value)}
                  placeholder="Principle title"
                  className="bg-card border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-green/40"
                />
                <input
                  value={p.description}
                  onChange={e => setPhilosophy(i, "description", e.target.value)}
                  placeholder="Short description"
                  className="bg-card border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-green/40"
                />
              </div>
              <button type="button" onClick={() => removePhilosophy(i)}
                className="text-dim hover:text-red-400 transition-colors pt-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </section>

        {/* ── Contact Links ──────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted">{"// CONTACT LINKS"}</p>
            <button type="button" onClick={addLink}
              className="flex items-center gap-1.5 text-xs text-green hover:opacity-80 font-mono transition-opacity">
              <Plus size={12} /> Add link
            </button>
          </div>
          <p className="text-[10px] text-dim">Icon: any single character (e.g. ⌥ ⊞ ◈ ◌ ▲ ⬡). Color: any hex code.</p>

          {data.links.length === 0 && (
            <p className="text-dim text-xs">No links yet.</p>
          )}

          {data.links.map((l, i) => (
            <div key={i} className="flex gap-2 items-center bg-surface border border-border rounded-lg p-3">
              {/* colour preview */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border"
                style={{ background: l.color + "20", borderColor: l.color + "40", color: l.color }}
              >
                {l.icon || "?"}
              </div>
              <input value={l.label} onChange={e => setLink(i, "label", e.target.value)}
                placeholder="Label" className="bg-card border border-border rounded px-2 py-1.5 text-xs text-text outline-none focus:border-green/40 w-24" />
              <input value={l.icon} onChange={e => setLink(i, "icon", e.target.value)}
                placeholder="Icon" className="bg-card border border-border rounded px-2 py-1.5 text-xs text-text outline-none focus:border-green/40 w-12 text-center" />
              <input value={l.color} onChange={e => setLink(i, "color", e.target.value)}
                placeholder="#EAEAEA" className="bg-card border border-border rounded px-2 py-1.5 text-xs text-text outline-none focus:border-green/40 w-24 font-mono" />
              <input value={l.href} onChange={e => setLink(i, "href", e.target.value)}
                placeholder="https://..." className="bg-card border border-border rounded px-2 py-1.5 text-xs text-text outline-none focus:border-green/40 flex-1" />
              <button type="button" onClick={() => removeLink(i)}
                className="text-dim hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </section>

        {/* ── Live Dashboard ────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] text-muted">{"// LIVE · DASHBOARD"}</p>
              <p className="text-[10px] text-dim mt-1">
                Add your profile URLs below and click &quot;Sync Stats&quot; to auto-fetch live numbers,
                or edit the counts manually and save.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-muted hover:text-text disabled:opacity-60 transition-colors font-mono"
              >
                <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Syncing…" : "Sync Stats"}
              </button>
              {syncMsg && (
                <span className={`text-[10px] font-mono ${syncMsg.startsWith("✓") ? "text-green" : "text-red-400"}`}>
                  {syncMsg}
                </span>
              )}
            </div>
          </div>

          {/* Profile URLs */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="LeetCode Profile URL" hint="e.g. https://leetcode.com/username">
              <input
                type="url"
                value={data.liveDashboard.leetcodeUrl}
                onChange={e => setDashboard("leetcodeUrl", e.target.value)}
                placeholder="https://leetcode.com/username"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
              />
            </Field>
            <Field label="GFG Profile URL" hint="e.g. https://auth.geeksforgeeks.org/user/username">
              <input
                type="url"
                value={data.liveDashboard.gfgUrl}
                onChange={e => setDashboard("gfgUrl", e.target.value)}
                placeholder="https://auth.geeksforgeeks.org/user/username"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
              />
            </Field>
            <Field label="GitHub Profile URL" hint="e.g. https://github.com/username">
              <input
                type="url"
                value={data.liveDashboard.githubUrl}
                onChange={e => setDashboard("githubUrl", e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
              />
            </Field>
          </div>

          {/* Manual overrides */}
          <p className="font-mono text-[10px] text-dim">{"// manual override (or result after sync)"}</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="LeetCode Solved">
              <input
                type="number" min={0}
                value={data.liveDashboard.leetcode}
                onChange={e => setDashboard("leetcode", e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
              />
            </Field>
            <Field label="GFG Score">
              <input
                type="number" min={0}
                value={data.liveDashboard.gfgScore}
                onChange={e => setDashboard("gfgScore", e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
              />
            </Field>
            <Field label="GitHub Commits">
              <input
                type="number" min={0}
                value={data.liveDashboard.githubCommits}
                onChange={e => setDashboard("githubCommits", e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
              />
            </Field>
          </div>
        </section>

        <FormActions loading={loading} submitLabel={saved ? "✓ Saved" : "Save Profile"} />
      </form>
    </div>
  );
}

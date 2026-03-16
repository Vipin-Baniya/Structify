"use client";
import { useEffect, useState } from "react";
import { Achievement } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Field, Input, Textarea, Select, Toggle, TagInput, FormActions } from "@/components/admin/FormFields";

const EMPTY: Partial<Achievement> = {
  title: "", organization: "", type: "other", description: "",
  impact: "", proofUrl: "", tags: [], featured: false,
};

export default function AdminAchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [form, setForm] = useState<Partial<Achievement>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/achievements");
    const d = await r.json(); if (Array.isArray(d)) setItems(d);
  }
  useEffect(() => { load(); }, []);

  function set(key: keyof Achievement, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/achievements/${editing}` : "/api/achievements";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY);
    load();
  }

 async function moveItem(id: string, dir: -1 | 1) {
  const idx = items.findIndex(x => x._id === id);
  const other = items[idx + dir];
  if (!other) return;
  await Promise.all([
    fetch(`/api/achievements/${id}`,        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: other.order }) }),
    fetch(`/api/achievements/${other._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: items[idx].order }) }),
  ]);
  load();
}

  async function handleDelete(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/achievements/${id}`, { method: "DELETE" });
    load();
  }

  const TYPE_COLOR: Record<string, string> = {
    hackathon: "text-orange-400", award: "text-yellow-400",
    internship: "text-blue-400", competition: "text-pink-400",
    research: "text-purple-400", other: "text-gray-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-text">Achievements</h1>
          <p className="text-muted text-sm">{items.length} total</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green text-bg rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus size={14} /> Add Achievement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-bold text-text mb-4">{editing ? "Edit Achievement" : "New Achievement"}</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title *">
              <Input value={form.title || ""} onChange={v => set("title", v)} required />
            </Field>
            <Field label="Organization">
              <Input value={form.organization || ""} onChange={v => set("organization", v)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={form.type || "other"} onChange={v => set("type", v)} options={[
                { value: "hackathon", label: "Hackathon" },
                { value: "award", label: "Award" },
                { value: "internship", label: "Internship" },
                { value: "competition", label: "Competition" },
                { value: "research", label: "Research" },
                { value: "other", label: "Other" },
              ]} />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date ? form.date.slice(0, 10) : ""} onChange={v => set("date", v)} />
            </Field>
          </div>

          <Field label="Description">
            <Textarea value={form.description || ""} onChange={v => set("description", v)} rows={3} />
          </Field>

          <Field label="Impact" hint="e.g. Top 3 out of 200 teams">
            <Input value={form.impact || ""} onChange={v => set("impact", v)} />
          </Field>

          <Field label="Proof URL">
            <Input value={form.proofUrl || ""} onChange={v => set("proofUrl", v)} placeholder="https://..." />
          </Field>

          <Field label="Tags">
            <TagInput tags={form.tags || []} onChange={tags => set("tags", tags)} />
          </Field>

          <Toggle label="Featured" value={form.featured || false} onChange={v => set("featured", v)} />

          <FormActions loading={loading} onCancel={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }} />
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No achievements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-text text-sm">{a.title}</span>
                  <span className={`font-mono text-[10px] capitalize ${TYPE_COLOR[a.type]}`}>{a.type}</span>
                </div>
                <p className="text-dim text-xs">{a.organization}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => moveItem(a._id, -1)} disabled={items.indexOf(a) === 0}
                  className="text-dim hover:text-text disabled:opacity-20 transition-colors p-1 font-mono text-[10px]">▲</button>
                <button onClick={() => moveItem(a._id, 1)} disabled={items.indexOf(a) === items.length - 1}
                  className="text-dim hover:text-text disabled:opacity-20 transition-colors p-1 font-mono text-[10px]">▼</button>
                <button onClick={() => { setForm(a); setEditing(a._id); setShowForm(true); }}
                  className="text-dim hover:text-green transition-colors p-1"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(a._id)}
                  className="text-dim hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

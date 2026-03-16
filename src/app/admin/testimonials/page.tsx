"use client";
import { useEffect, useState } from "react";
import { Testimonial } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Field, Input, Textarea, Toggle, FormActions } from "@/components/admin/FormFields";

const EMPTY: Partial<Testimonial> = {
  name: "",
  role: "",
  organization: "",
  quote: "",
  avatarUrl: "",
  linkedinUrl: "",
  featured: false,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState<Partial<Testimonial>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/testimonials");
    const d = await r.json();
    if (Array.isArray(d)) setItems(d);
  }

  useEffect(() => {
    load();
  }, []);

  function set(key: keyof Testimonial, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/testimonials/${editing}` : "/api/testimonials";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY);

    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;

    await fetch(`/api/testimonials/${id}`, {
      method: "DELETE",
    });

    load();
  }

  async function moveItem(id: string, dir: -1 | 1) {
    const idx = items.findIndex((x) => x._id === id);
    const other = items[idx + dir];
    if (!other) return;

    await Promise.all([
      fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: other.order }),
      }),
      fetch(`/api/testimonials/${other._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: items[idx].order }),
      }),
    ]);

    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-text">Testimonials</h1>
          <p className="text-muted text-sm">{items.length} total</p>
        </div>

        <button
          onClick={() => {
            setForm(EMPTY);
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green text-bg rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="font-bold text-text mb-4">
            {editing ? "Edit Testimonial" : "New Testimonial"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <Input
                value={form.name || ""}
                onChange={(v) => set("name", v)}
                required
              />
            </Field>

            <Field label="Role" hint="e.g. Professor of AI, Senior Engineer">
              <Input
                value={form.role || ""}
                onChange={(v) => set("role", v)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Organization">
              <Input
                value={form.organization || ""}
                onChange={(v) => set("organization", v)}
                placeholder="IIT Indore, Google..."
              />
            </Field>

            <Field label="LinkedIn URL">
              <Input
                value={form.linkedinUrl || ""}
                onChange={(v) => set("linkedinUrl", v)}
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
          </div>

          <Field label="Quote *" hint="The testimonial text — no need for quotes">
            <Textarea
              value={form.quote || ""}
              onChange={(v) => set("quote", v)}
              rows={3}
              placeholder="Vipin is an exceptional engineer who..."
            />
          </Field>

          <Field label="Avatar URL" hint="Optional photo">
            <Input
              value={form.avatarUrl || ""}
              onChange={(v) => set("avatarUrl", v)}
              placeholder="https://..."
            />
          </Field>

          <Toggle
            label="Featured"
            value={form.featured || false}
            onChange={(v) => set("featured", v)}
          />

          <FormActions
            loading={loading}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              setForm(EMPTY);
            }}
          />
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">
            No testimonials yet. Add your first one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t._id}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
            >
              {t.avatarUrl ? (
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center font-black text-green text-sm flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-text text-sm">{t.name}</span>

                  {(t.role || t.organization) && (
                    <span className="text-dim text-xs">
                      · {t.role}
                      {t.role && t.organization ? " · " : ""}
                      {t.organization}
                    </span>
                  )}
                </div>

                <p className="text-muted text-xs line-clamp-2 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveItem(t._id, -1)}
                  disabled={items.indexOf(t) === 0}
                  className="text-dim hover:text-text disabled:opacity-20 p-1 font-mono text-[10px]"
                >
                  ▲
                </button>

                <button
                  onClick={() => moveItem(t._id, 1)}
                  disabled={items.indexOf(t) === items.length - 1}
                  className="text-dim hover:text-text disabled:opacity-20 p-1 font-mono text-[10px]"
                >
                  ▼
                </button>

                <button
                  onClick={() => {
                    setForm(t);
                    setEditing(t._id);
                    setShowForm(true);
                  }}
                  className="text-dim hover:text-green p-1"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => handleDelete(t._id)}
                  className="text-dim hover:text-red-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

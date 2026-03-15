"use client";
import { useEffect, useState } from "react";
import { Testimonial } from "@/types";

export default function TestimonialsView() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setItems(d); })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div>
      <h1 className="text-3xl font-black text-text mb-1">Testimonials</h1>
      <p className="text-muted text-sm mb-8">What collaborators and mentors say.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t._id} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-green/30 transition-colors">
            <p className="text-text text-sm leading-relaxed flex-1">
              <span className="text-green text-xl font-black mr-1">&ldquo;</span>
              {t.quote}
              <span className="text-green text-xl font-black ml-1">&rdquo;</span>
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              {t.avatarUrl ? (
                <img src={t.avatarUrl} alt={t.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0 font-black text-green text-sm">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                {t.linkedinUrl ? (
                  <a href={t.linkedinUrl} target="_blank" rel="noreferrer"
                    className="font-semibold text-text text-sm hover:text-green transition-colors">
                    {t.name}
                  </a>
                ) : (
                  <p className="font-semibold text-text text-sm">{t.name}</p>
                )}
                {(t.role || t.organization) && (
                  <p className="text-dim text-xs truncate">
                    {t.role}{t.role && t.organization ? " · " : ""}{t.organization}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

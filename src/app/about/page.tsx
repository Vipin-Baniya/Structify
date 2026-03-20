"use client";
import { useEffect, useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";

interface PhilosophyEntry { title: string; description: string; }
interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
}

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
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black text-text mb-1">About</h1>
        <p className="text-muted text-sm mb-8">
          {profile?.tagline ?? "The architect behind Structify."}
        </p>

        <div className="space-y-4">
          {/* Bio */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="font-mono text-[10px] text-muted mb-3">{"// WHO I AM"}</p>
            {profile ? (
              <div className="flex items-start gap-4">
                {profile.avatarUrl && (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border"
                  />
                )}
                <p className="text-text text-sm leading-relaxed">
                  {"I'm "}
                  <strong className="text-green">{profile.name}</strong>
                  {" — "}{profile.bio}
                </p>
              </div>
            ) : (
              <div className="h-10 bg-surface rounded animate-pulse" />
            )}
          </div>

          {/* Philosophy */}
          {philosophy.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="font-mono text-[10px] text-muted mb-4">{"// PHILOSOPHY"}</p>
              {philosophy.map((p, i) => (
                <div key={i} className="flex gap-3 mb-3 last:mb-0">
                  <span className="text-green text-sm flex-shrink-0 mt-0.5">◆</span>
                  <div>
                    <p className="font-semibold text-text text-sm">{p.title}</p>
                    <p className="text-muted text-xs">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

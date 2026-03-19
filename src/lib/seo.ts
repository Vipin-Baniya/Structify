import { Metadata } from "next";
import { connectDB } from "./db";
import Profile from "@/models/Profile";
import Project from "@/models/Project";

const OWNER_ID = process.env.OWNER_ID || "vipin";
const BASE_URL = process.env.NEXTAUTH_URL || "https://structify.vercel.app";

export async function getSiteMetadata(): Promise<{ name: string; tagline: string; bio: string; avatarUrl: string }> {
  try {
    await connectDB();
    const profile = await Profile.findOne({ ownerId: OWNER_ID }).lean() as any;
    if (profile) {
      return {
        name:      profile.name     || "Vipin Baniya",
        tagline:   profile.tagline  || "Where Systems Take Shape.",
        bio:       profile.bio      || "",
        avatarUrl: profile.avatarUrl || "",
      };
    }
  } catch { /* DB not ready at build time */ }
  return { name: "Vipin Baniya", tagline: "Where Systems Take Shape.", bio: "", avatarUrl: "" };
}

export async function getProjectMetadata(slug: string): Promise<Metadata> {
  try {
    await connectDB();
    const project = await Project.findOne({ slug, ownerId: OWNER_ID }).lean() as any;
    if (project) {
      return {
        title:       `${project.title} — Structify`,
        description: project.description || `${project.title} — built with ${project.techStack?.join(", ")}`,
        openGraph: {
          title:       project.title,
          description: project.description || "",
          type:        "website",
          ...(project.banner ? { images: [{ url: project.banner }] } : {}),
        },
        twitter: {
          card:        "summary_large_image",
          title:       project.title,
          description: project.description || "",
          ...(project.banner ? { images: [project.banner] } : {}),
        },
      };
    }
  } catch { /* fallback */ }
  return {
    title: "Project — Structify",
    description: "Engineering project on Structify.",
  };
}

export function buildBaseMetadata(name: string, tagline: string, bio: string, avatarUrl: string): Metadata {
  const description = bio || `${name} — ${tagline}`;
  return {
    title:        { default: `${name} - Portfolio`, template: `%s — ${name} - Portfolio` },
    description,
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title:       `Structify — ${name}`,
      description,
      type:        "website",
      siteName:    "Structify",
      ...(avatarUrl ? { images: [{ url: avatarUrl }] } : {}),
    },
    twitter: {
      card:        "summary",
      title:       `Structify — ${name}`,
      description,
    },
  };
}

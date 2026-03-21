import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  name: "Vipin Baniya",
  tagline: "The architect behind Structify.",
  bio: "I'm a systems engineer and AI researcher building infrastructure that matters. I work at the intersection of AI, power systems, and full-stack engineering.",
  avatarUrl: "",
  resumeUrl: "",
  philosophy: [
    { title: "Structure over chaos",       description: "Systems need clear architecture before code." },
    { title: "Systems over scripts",       description: "Build platforms, not one-off solutions." },
    { title: "Architecture over shortcuts",description: "Design for scale from day one." },
    { title: "Depth over decoration",      description: "Substance drives lasting impact." },
  ],
  links: [
    { label: "GitHub",   icon: "⌥", href: "https://github.com/vipinbaniya",      color: "#FFFFFF" },
    { label: "LinkedIn", icon: "⊞", href: "https://linkedin.com/in/vipinbaniya", color: "#3D9DF2" },
    { label: "LeetCode", icon: "◈", href: "https://leetcode.com/vipinbaniya",    color: "#F59E0B" },
    { label: "Email",    icon: "◌", href: "mailto:vipin@example.com",             color: "#1DB954" },
  ],
  liveDashboard: { leetcode: 300, gfgScore: 1200, githubCommits: 500, leetcodeUrl: "", gfgUrl: "", githubUrl: "" },
};

export async function GET() {
  try {
    await connectDB();
    let profile = await Profile.findOne({ ownerId: OWNER_ID }).lean();
    // Seed defaults on first fetch if no profile exists yet
    if (!profile) {
      profile = await Profile.create({ ...DEFAULTS, ownerId: OWNER_ID });
    }
    return ok(profile);
  } catch (e: any) {
    return err(e.message || "Failed to fetch profile", 500);
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    // Strip MongoDB internal fields to prevent immutable field errors
    const { _id, __v, createdAt, updatedAt, ...updateData } = body;
    const profile = await Profile.findOneAndUpdate(
      { ownerId: OWNER_ID },
      { $set: { ...updateData, ownerId: OWNER_ID } },
      { new: true, upsert: true }
    );
    return ok(profile);
  } catch (e: any) {
    return err(e.message || "Failed to update profile", 500);
  }
}

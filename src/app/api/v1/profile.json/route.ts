import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Achievement from "@/models/Achievement";
import Certificate from "@/models/Certificate";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";
import Post from "@/models/Post";
import { ok, err } from "@/lib/apiHelpers";

const OWNER_ID = process.env.OWNER_ID || "vipin";

// GET /api/v1/profile.json
// Public read-only API for the entire Structify profile
// Useful for embedding on other sites, CLI tools, or integrations
export async function GET() {
  try {
    await connectDB();

    const [profile, projects, achievements, certificates, experience, skills, posts] = await Promise.all([
      Profile.findOne({ ownerId: OWNER_ID }).lean(),
      Project.find({ ownerId: OWNER_ID }).sort({ order: 1 })
        .select("-ownerId -__v -architectureDiagram")
        .lean(),
      Achievement.find({ ownerId: OWNER_ID }).sort({ order: 1 })
        .select("-ownerId -__v")
        .lean(),
      Certificate.find({ ownerId: OWNER_ID }).sort({ order: 1 })
        .select("-ownerId -__v -imagePublicId")
        .lean(),
      Experience.find({ ownerId: OWNER_ID }).sort({ order: 1 })
        .select("-ownerId -__v")
        .lean(),
      Skill.find({ ownerId: OWNER_ID }).sort({ category: 1, order: 1 })
        .select("-ownerId -__v")
        .lean(),
      Post.find({ ownerId: OWNER_ID, published: true }).sort({ order: 1 })
        .select("-ownerId -__v -content") // exclude full content from list
        .lean(),
    ]);

    const payload = {
      meta: {
        version:   "1.0",
        generated: new Date().toISOString(),
        source:    "https://vipinbaniya.dev",
      },
      profile: profile
        ? {
            name:      (profile as any).name,
            tagline:   (profile as any).tagline,
            bio:       (profile as any).bio,
            avatarUrl: (profile as any).avatarUrl,
            resumeUrl: (profile as any).resumeUrl,
            links:     (profile as any).links,
          }
        : null,
      projects,
      skills,
      achievements,
      certificates,
      experience,
      posts,
      stats: {
        totalProjects:    projects.length,
        totalViews:       (projects as any[]).reduce((s, p) => s + (p.views || 0), 0),
        featuredProjects: (projects as any[]).filter(p => p.featured).length,
        totalSkills:      skills.length,
        totalPosts:       posts.length,
      },
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",  // public CORS
        "Cache-Control":               "public, max-age=300", // 5 min cache
      },
    });
  } catch (e: any) {
    return err(e.message || "Failed to generate public API response", 500);
  }
}

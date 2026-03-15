import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Achievement from "@/models/Achievement";
import Certificate from "@/models/Certificate";
import Skill from "@/models/Skill";
import { ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return ok({ projects: [], achievements: [], certificates: [], skills: [] });

  try {
    await connectDB();
    const regex = new RegExp(q, "i");

    const [projects, achievements, certificates, skills] = await Promise.all([
      Project.find({
        ownerId: OWNER_ID,
        $or: [{ title: regex }, { description: regex }, { techStack: regex }],
      }).select("title slug description techStack status banner").limit(5).lean(),

      Achievement.find({
        ownerId: OWNER_ID,
        $or: [{ title: regex }, { organization: regex }, { description: regex }, { tags: regex }],
      }).select("title organization type description").limit(4).lean(),

      Certificate.find({
        ownerId: OWNER_ID,
        $or: [{ title: regex }, { issuer: regex }, { skills: regex }],
      }).select("title issuer category imageUrl").limit(4).lean(),

      Skill.find({
        ownerId: OWNER_ID,
        $or: [{ name: regex }],
      }).select("name category proficiency").limit(6).lean(),
    ]);

    return ok({ projects, achievements, certificates, skills });
  } catch (e: any) {
    return err(e.message || "Search failed", 500);
  }
}

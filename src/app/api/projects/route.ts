import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");

    const query: Record<string, unknown> = { ownerId: OWNER_ID };
    if (featured === "true") query.featured = true;
    if (category) query.category = category;

    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return ok(projects);
  } catch (e: any) {
    return err(e.message || "Failed to fetch projects", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();
    if (!body.title) return err("Title is required");

    const slug = (body.slug || body.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const exists = await Project.findOne({ slug });
    const finalSlug = exists ? `${slug}-${Date.now()}` : slug;

    const project = await Project.create({ ...body, ownerId: OWNER_ID, slug: finalSlug });
    return ok(project, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create project", 500);
  }
}

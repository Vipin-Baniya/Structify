import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Highlight from "@/models/Highlight";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const projectSlug = searchParams.get("slug");
    const query: Record<string, unknown> = { ownerId: OWNER_ID };
    if (projectSlug) query.projectSlug = projectSlug;
    const items = await Highlight.find(query).sort({ order: 1 }).lean();
    return ok(items);
  } catch (e: any) {
    return err(e.message || "Failed to fetch highlights", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    if (!body.projectSlug || !body.filePath || !body.title)
      return err("projectSlug, filePath, and title are required");
    const item = await Highlight.create({ ...body, ownerId: OWNER_ID });
    return ok(item, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create highlight", 500);
  }
}

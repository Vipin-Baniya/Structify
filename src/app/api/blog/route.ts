import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") !== "false";
    const query: Record<string, unknown> = { ownerId: OWNER_ID };
    if (publishedOnly) query.published = true;
    const posts = await Post.find(query).sort({ order: 1, createdAt: -1 })
      .select("-content") // exclude body from list — load on detail only
      .lean();
    return ok(posts);
  } catch (e: any) {
    return err(e.message || "Failed to fetch posts", 500);
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
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const exists = await Post.findOne({ slug });
    const finalSlug = exists ? `${slug}-${Date.now()}` : slug;
    const post = await Post.create({ ...body, ownerId: OWNER_ID, slug: finalSlug });
    return ok(post, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create post", 500);
  }
}

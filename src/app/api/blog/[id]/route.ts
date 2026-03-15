import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

type Params = { params: { id: string } };

// GET /api/blog/:id  — public, always filters published:true
// Admin reads drafts via the list endpoint (?published=false), not this route
export async function GET(_: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const isObjectId = mongoose.isValidObjectId(params.id);
    // Always require published:true — prevents draft leakage via ID enumeration
    const query = isObjectId
      ? { ownerId: OWNER_ID, _id: params.id, published: true }
      : { ownerId: OWNER_ID, slug: params.id,   published: true };
    const post = await Post.findOne(query).lean();
    if (!post) return err("Not found", 404);
    return ok(post);
  } catch (e: any) {
    return err(e.message || "Failed to fetch post", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    const post = await Post.findOneAndUpdate(
      { _id: params.id, ownerId: OWNER_ID },
      { $set: body }, { new: true }
    );
    if (!post) return err("Not found", 404);
    return ok(post);
  } catch (e: any) {
    return err(e.message || "Failed to update post", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    await Post.findOneAndDelete({ _id: params.id, ownerId: OWNER_ID });
    return ok({ deleted: true });
  } catch (e: any) {
    return err(e.message || "Failed to delete post", 500);
  }
}

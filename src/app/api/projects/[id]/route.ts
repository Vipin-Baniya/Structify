import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

type Params = { params: { id: string } };

// GET /api/projects/:id  — public (by id or slug)
// Increments view counter when fetched by slug (i.e. from a public project page)
export async function GET(_: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const isObjectId = mongoose.isValidObjectId(params.id);
    const query = isObjectId
      ? { ownerId: OWNER_ID, _id: params.id }
      : { ownerId: OWNER_ID, slug: params.id };

    // Increment views only on slug-based (public page) fetches, not admin ID lookups
    const project = isObjectId
      ? await Project.findOne(query).lean()
      : await Project.findOneAndUpdate(
          query,
          { $inc: { views: 1 } },
          { new: true }
        ).lean();

    if (!project) return err("Not found", 404);
    return ok(project);
  } catch (e: any) {
    return err(e.message || "Failed to fetch project", 500);
  }
}

// PATCH /api/projects/:id  — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    // Strip MongoDB internal fields and never overwrite the views counter
    const { _id, __v, createdAt, updatedAt, views, ...updateData } = body;
    const project = await Project.findOneAndUpdate(
      { _id: params.id, ownerId: OWNER_ID },
      { $set: updateData },
      { new: true }
    );
    if (!project) return err("Not found", 404);
    return ok(project);
  } catch (e: any) {
    return err(e.message || "Failed to update project", 500);
  }
}

// DELETE /api/projects/:id  — admin only
export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    await Project.findOneAndDelete({ _id: params.id, ownerId: OWNER_ID });
    return ok({ deleted: true });
  } catch (e: any) {
    return err(e.message || "Failed to delete project", 500);
  }
}

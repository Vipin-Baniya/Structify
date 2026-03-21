import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    const { _id, __v, createdAt, updatedAt, ...updateData } = body;
    const item = await Testimonial.findOneAndUpdate(
      { _id: params.id, ownerId: OWNER_ID },
      { $set: updateData }, { new: true }
    );
    if (!item) return err("Not found", 404);
    return ok(item);
  } catch (e: any) {
    return err(e.message || "Failed to update testimonial", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    await Testimonial.findOneAndDelete({ _id: params.id, ownerId: OWNER_ID });
    return ok({ deleted: true });
  } catch (e: any) {
    return err(e.message || "Failed to delete testimonial", 500);
  }
}

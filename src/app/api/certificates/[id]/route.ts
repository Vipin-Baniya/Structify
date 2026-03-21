import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();

    if (body.imageBase64?.startsWith("data:")) {
      try {
        const existing = await Certificate.findById(params.id);
        if (existing?.imagePublicId) await deleteImage(existing.imagePublicId);
        const { url, publicId } = await uploadImage(body.imageBase64, "structify/certificates");
        body.imageUrl = url;
        body.imagePublicId = publicId;
      } catch {
        // Cloudinary not configured - skip
      }
      delete body.imageBase64;
    }

    const { _id, __v, createdAt, updatedAt, ...updateData } = body;
    const item = await Certificate.findOneAndUpdate(
      { _id: params.id, ownerId: OWNER_ID },
      { $set: updateData },
      { new: true }
    );
    if (!item) return err("Not found", 404);
    return ok(item);
  } catch (e: any) {
    return err(e.message || "Failed to update certificate", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const item = await Certificate.findOneAndDelete({ _id: params.id, ownerId: OWNER_ID });
    if (item?.imagePublicId) {
      await deleteImage(item.imagePublicId).catch(() => {});
    }
    return ok({ deleted: true });
  } catch (e: any) {
    return err(e.message || "Failed to delete certificate", 500);
  }
}

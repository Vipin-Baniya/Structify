import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { uploadImage } from "@/lib/cloudinary";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET() {
  try {
    await connectDB();
    const items = await Certificate.find({ ownerId: OWNER_ID }).sort({ order: 1, createdAt: -1 }).lean();
    return ok(items);
  } catch (e: any) {
    return err(e.message || "Failed to fetch certificates", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();
    if (!body.title) return err("Title is required");

    let imageUrl = body.imageUrl;
    let imagePublicId = "";

    if (body.imageBase64 && body.imageBase64.startsWith("data:")) {
      try {
        const { url, publicId } = await uploadImage(body.imageBase64, "structify/certificates");
        imageUrl = url;
        imagePublicId = publicId;
      } catch {
        // Cloudinary not configured - skip image upload
      }
    }

    const item = await Certificate.create({
      ...body,
      ownerId: OWNER_ID,
      imageUrl,
      imagePublicId,
    });
    return ok(item, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create certificate", 500);
  }
}

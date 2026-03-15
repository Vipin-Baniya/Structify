import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAdmin, ok, err } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  if (!body.data || !body.data.startsWith("data:")) return err("Invalid image data");

  try {
    const result = await uploadImage(body.data, body.folder || "structify");
    return ok(result);
  } catch (e: any) {
    return err(e.message || "Upload failed", 500);
  }
}

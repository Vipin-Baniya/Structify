import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET() {
  try {
    await connectDB();
    const items = await Testimonial.find({ ownerId: OWNER_ID }).sort({ order: 1, createdAt: -1 }).lean();
    return ok(items);
  } catch (e: any) {
    return err(e.message || "Failed to fetch testimonials", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !body.quote) return err("Name and quote are required");
    const item = await Testimonial.create({ ...body, ownerId: OWNER_ID });
    return ok(item, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create testimonial", 500);
  }
}

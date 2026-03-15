import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Experience from "@/models/Experience";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET() {
  try {
    await connectDB();
    const items = await Experience.find({ ownerId: OWNER_ID }).sort({ order: 1, startDate: -1 }).lean();
    return ok(items);
  } catch (e: any) {
    return err(e.message || "Failed to fetch experience", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    if (!body.organization || !body.role) return err("Organization and role are required");
    const item = await Experience.create({ ...body, ownerId: OWNER_ID });
    return ok(item, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create experience", 500);
  }
}

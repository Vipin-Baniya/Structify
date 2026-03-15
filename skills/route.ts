import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Skill from "@/models/Skill";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export async function GET() {
  try {
    await connectDB();
    const items = await Skill.find({ ownerId: OWNER_ID }).sort({ category: 1, order: 1 }).lean();
    return ok(items);
  } catch (e: any) {
    return err(e.message || "Failed to fetch skills", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name) return err("Name is required");
    const item = await Skill.create({ ...body, ownerId: OWNER_ID });
    return ok(item, 201);
  } catch (e: any) {
    return err(e.message || "Failed to create skill", 500);
  }
}

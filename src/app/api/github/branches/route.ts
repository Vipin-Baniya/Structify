import { NextRequest } from "next/server";
import { getRepoBranches } from "@/lib/github";
import { ok, err } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo  = searchParams.get("repo");
  if (!owner || !repo) return err("owner and repo required");
  try {
    const branches = await getRepoBranches(owner, repo);
    return ok(branches);
  } catch (e: any) {
    return err(e.message || "Failed to fetch branches", 500);
  }
}

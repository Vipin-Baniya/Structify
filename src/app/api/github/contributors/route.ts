import { NextRequest } from "next/server";
import { getContributors } from "@/lib/github";
import { ok, err } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo  = searchParams.get("repo");
  if (!owner || !repo) return err("owner and repo required");
  try {
    const contributors = await getContributors(owner, repo);
    return ok(contributors);
  } catch (e: any) {
    return err(e.message || "Failed to fetch contributors", 500);
  }
}

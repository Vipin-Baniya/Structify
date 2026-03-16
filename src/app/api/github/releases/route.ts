import { NextRequest } from "next/server";
import { getRepoReleases } from "@/lib/github";
import { ok, err } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo  = searchParams.get("repo");
  if (!owner || !repo) return err("owner and repo required");
  try {
    const releases = await getRepoReleases(owner, repo);
    return ok(releases);
  } catch (e: any) {
    return err(e.message || "Failed to fetch releases", 500);
  }
}

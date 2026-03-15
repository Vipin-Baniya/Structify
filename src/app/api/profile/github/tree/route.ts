import { NextRequest } from "next/server";
import { getRepoTree } from "@/lib/github";
import { ok, err } from "@/lib/apiHelpers";

// GET /api/github/tree?owner=xxx&repo=yyy&branch=main
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner  = searchParams.get("owner");
  const repo   = searchParams.get("repo");
  const branch = searchParams.get("branch") || "main";

  if (!owner || !repo) return err("owner and repo are required");

  try {
    const tree = await getRepoTree(owner, repo, branch);
    return ok(tree);
  } catch (e: any) {
    return err(e.message || "Failed to fetch repo tree", 500);
  }
}

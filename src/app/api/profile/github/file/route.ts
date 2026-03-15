import { NextRequest } from "next/server";
import { getFileContent, getRecentCommits, getRepoInfo } from "@/lib/github";
import { ok, err } from "@/lib/apiHelpers";

// GET /api/github/file?owner=xxx&repo=yyy&path=src/main.py
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo  = searchParams.get("repo");
  const path  = searchParams.get("path");
  const type  = searchParams.get("type"); // "file" | "commits" | "info"

  if (!owner || !repo) return err("owner and repo are required");

  try {
    if (type === "commits") {
      const commits = await getRecentCommits(owner, repo);
      return ok(commits);
    }

    if (type === "info") {
      const info = await getRepoInfo(owner, repo);
      return ok(info);
    }

    if (!path) return err("path is required for file content");
    const file = await getFileContent(owner, repo, path);
    return ok(file);
  } catch (e: any) {
    return err(e.message || "Failed to fetch file", 500);
  }
}

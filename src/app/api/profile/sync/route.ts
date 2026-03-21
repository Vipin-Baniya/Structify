import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";
import { requireAdmin, ok, err, OWNER_ID } from "@/lib/apiHelpers";

export const dynamic = "force-dynamic";

// Fetch solved-problem count from LeetCode's public GraphQL API
async function fetchLeetCodeSolved(profileUrl: string): Promise<number | null> {
  try {
    const username = profileUrl.trim().replace(/\/$/, "").split("/").pop();
    if (!username) return null;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Referer": "https://leetcode.com" },
      body: JSON.stringify({
        // Use variable to avoid injection
        query: "query getUserStats($username: String!) { matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count } } } }",
        variables: { username },
      }),
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const allEntry = data?.data?.matchedUser?.submitStats?.acSubmissionNum?.find(
      (e: { difficulty: string; count: number }) => e.difficulty === "All"
    );
    return allEntry?.count ?? null;
  } catch {
    return null;
  }
}

// Fetch GFG score from unofficial public stats API
async function fetchGFGScore(profileUrl: string): Promise<number | null> {
  try {
    const username = profileUrl.trim().replace(/\/$/, "").split("/").pop();
    if (!username) return null;

    const res = await fetch(
      `https://geeks-for-geeks-stats-api.vercel.app/?userName=${encodeURIComponent(username)}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // The API returns { info: { codingScore: number, ... }, ... }
    const score = data?.info?.codingScore ?? data?.codingScore ?? null;
    return typeof score === "number" ? score : null;
  } catch {
    return null;
  }
}

// Fetch total public commit count from GitHub API
async function fetchGitHubCommits(profileUrl: string): Promise<number | null> {
  try {
    const username = profileUrl.trim().replace(/\/$/, "").split("/").pop();
    if (!username) return null;

    const searchRes = await fetch(
      `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}&per_page=1`,
      {
        headers: { "Accept": "application/vnd.github+json" },
        next: { revalidate: 0 },
      }
    );
    if (!searchRes.ok) {
      // Fallback: use repo count as a rough indicator
      const userRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}`,
        { headers: { "Accept": "application/vnd.github+json" }, next: { revalidate: 0 } }
      );
      if (!userRes.ok) return null;
      const userData = await userRes.json();
      return typeof userData?.public_repos === "number" ? userData.public_repos * 10 : null;
    }
    const searchData = await searchRes.json();
    return searchData?.total_count ?? null;
  } catch {
    return null;
  }
}

// POST /api/profile/sync — fetch live stats from external profiles and save to DB
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const profile = await Profile.findOne({ ownerId: OWNER_ID }).lean() as any;
    if (!profile) return err("Profile not found", 404);

    const { leetcodeUrl, gfgUrl, githubUrl } = profile.liveDashboard ?? {};

    const results: { leetcode?: number; gfgScore?: number; githubCommits?: number } = {};
    const errors: string[] = [];

    if (leetcodeUrl) {
      const val = await fetchLeetCodeSolved(leetcodeUrl);
      if (val !== null) results.leetcode = val;
      else errors.push("LeetCode fetch failed");
    }
    if (gfgUrl) {
      const val = await fetchGFGScore(gfgUrl);
      if (val !== null) results.gfgScore = val;
      else errors.push("GFG fetch failed");
    }
    if (githubUrl) {
      const val = await fetchGitHubCommits(githubUrl);
      if (val !== null) results.githubCommits = val;
      else errors.push("GitHub fetch failed");
    }

    if (Object.keys(results).length === 0) {
      return NextResponse.json(
        { error: "No stats fetched. Add profile URLs and try again.", errors },
        { status: 422 }
      );
    }

    // Merge fetched values into existing liveDashboard
    const updatedDashboard = { ...profile.liveDashboard, ...results };
    const updated = await Profile.findOneAndUpdate(
      { ownerId: OWNER_ID },
      { $set: { liveDashboard: updatedDashboard } },
      { new: true }
    );

    return NextResponse.json({ liveDashboard: (updated as any).liveDashboard, errors });
  } catch (e: any) {
    return err(e.message || "Sync failed", 500);
  }
}

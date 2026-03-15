import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const OWNER_ID = process.env.OWNER_ID || "vipin";

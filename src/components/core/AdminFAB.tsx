"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Settings } from "lucide-react";

/**
 * Floating admin button shown only when an admin session is active.
 * Uses a `mounted` guard so it never renders during SSR or causes a
 * transition flash while the session is loading.
 */
export function AdminFAB() {
  const { data: session, status } = useSession();
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || status !== "authenticated" || !session) return null;

  return (
    <Link
      href="/admin/dashboard"
      className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full
                 shadow-lg text-xs font-mono font-semibold transition-all duration-200
                 hover:scale-105 active:scale-95"
      style={{
        background:  "var(--accent)",
        color:       "var(--bg)",
        boxShadow:   "0 4px 24px color-mix(in srgb, var(--accent) 30%, transparent)",
      }}
      title="Open Admin Panel"
    >
      <Settings size={13} />
      <span>Admin</span>
    </Link>
  );
}

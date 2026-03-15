"use client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-green" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-[#0F0F0F]">
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

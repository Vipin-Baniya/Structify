import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/ui/SessionProvider";
import { getSiteMetadata, buildBaseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { name, tagline, bio, avatarUrl } = await getSiteMetadata();
  return buildBaseMetadata(name, tagline, bio, avatarUrl);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

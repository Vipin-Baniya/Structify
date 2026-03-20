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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

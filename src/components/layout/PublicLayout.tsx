import LayoutRouter from "@/components/core/LayoutRouter";

/**
 * Public-facing layout.
 * Delegates to LayoutRouter which picks the correct OS-adaptive UI.
 * The default (and SSR) layout is the Spotify-inspired dark theme.
 */
export default function PublicLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return <LayoutRouter active={active}>{children}</LayoutRouter>;
}

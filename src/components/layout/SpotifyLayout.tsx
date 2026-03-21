import MobileLayout from "@/components/layout/MobileLayout";
import Sidebar      from "@/components/layout/Sidebar";
import PlayerBar    from "@/components/layout/PlayerBar";
import { PlayerProvider }  from "@/components/ui/PlayerContext";
import { CommandPalette }  from "@/components/core/CommandPalette";
import { AdminFAB }        from "@/components/core/AdminFAB";

/**
 * Default Spotify-inspired dark layout used when no specific OS theme is active.
 * Contains the left sidebar, mobile drawer, main content area, and player bar.
 */
export default function SpotifyLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?:  string;
}) {
  return (
    <PlayerProvider>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden bg-bg">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-col md:shrink-0">
          <Sidebar active={active} />
        </div>

        {/* Mobile hamburger + slide-out drawer */}
        <MobileLayout active={active} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-surface">
          <div className="pt-[52px] md:pt-0 pb-4 md:pb-8 p-4 md:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Sticky Spotify-style project player bar */}
      <PlayerBar />

      {/* Floating admin button (only visible when admin session is active) */}
      <AdminFAB />
    </PlayerProvider>
  );
}

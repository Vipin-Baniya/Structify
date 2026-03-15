import MobileLayout from "./MobileLayout";
import Sidebar from "./Sidebar";
import PlayerBar from "./PlayerBar";
import { PlayerProvider } from "@/components/ui/PlayerContext";

export default function PublicLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <PlayerProvider>
      <div className="flex h-screen overflow-hidden bg-bg">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:flex md:flex-col md:shrink-0">
          <Sidebar active={active} />
        </div>

        {/* Mobile hamburger header + slide-out drawer */}
        <MobileLayout active={active} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#181818]">
          {/* pt-[52px] clears mobile fixed bar; pb-20 clears player bar when active */}
          <div className="pt-[52px] md:pt-0 pb-4 md:pb-8 p-4 md:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Sticky Spotify-style project player bar */}
      <PlayerBar />
    </PlayerProvider>
  );
}

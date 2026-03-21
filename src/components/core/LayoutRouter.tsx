"use client";
import dynamic      from "next/dynamic";
import { useState, useEffect } from "react";
import { useOS }   from "@/hooks/useOS";
import SpotifyLayout from "@/components/layout/SpotifyLayout";

// OS-specific layouts loaded lazily so SSR only ever renders the Spotify default
const MacLayout     = dynamic(() => import("@/components/os/macos/MacLayout"),       { ssr: false });
const WindowsLayout = dynamic(() => import("@/components/os/windows/WindowsLayout"), { ssr: false });
const LinuxLayout   = dynamic(() => import("@/components/os/linux/TerminalLayout"),  { ssr: false });
const AndroidLayout = dynamic(() => import("@/components/os/android/AndroidLayout"), { ssr: false });
const IOSLayout     = dynamic(() => import("@/components/os/ios/IOSLayout"),         { ssr: false });

interface Props {
  children: React.ReactNode;
  active?:  string;
}

export default function LayoutRouter({ children, active }: Props) {
  const { os }          = useOS();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // During SSR and the initial client render (before hydration), always use
  // SpotifyLayout.  This prevents a brief flash of the wrong layout — and
  // prevents the admin-control transition from appearing while the session
  // and OS preference are still loading.
  if (!mounted) return <SpotifyLayout active={active}>{children}</SpotifyLayout>;

  switch (os) {
    case "macos":   return <MacLayout     active={active}>{children}</MacLayout>;
    case "windows": return <WindowsLayout active={active}>{children}</WindowsLayout>;
    case "linux":   return <LinuxLayout   active={active}>{children}</LinuxLayout>;
    case "android": return <AndroidLayout active={active}>{children}</AndroidLayout>;
    case "ios":     return <IOSLayout     active={active}>{children}</IOSLayout>;
    default:        return <SpotifyLayout active={active}>{children}</SpotifyLayout>;
  }
}

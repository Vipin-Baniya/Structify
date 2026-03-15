"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Project } from "@/types";

interface PlayerState {
  project: Project | null;
  setProject: (p: Project | null) => void;
}

const PlayerContext = createContext<PlayerState>({ project: null, setProject: () => {} });

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  return (
    <PlayerContext.Provider value={{ project, setProject }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

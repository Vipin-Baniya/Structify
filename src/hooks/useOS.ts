"use client";
import { useEffect, useState, useCallback } from "react";

export type OS = "macos" | "windows" | "linux" | "android" | "ios" | "default";
export type OSPreference = OS | "auto";

const STORAGE_KEY = "structify-os-theme";
const isBrowser   = typeof window !== "undefined";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "default";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua))           return "android";
  if (/iPhone|iPad|iPod/i.test(ua))  return "ios";
  if (/Win/i.test(ua))               return "windows";
  if (/Mac/i.test(ua))               return "macos";
  if (/Linux/i.test(ua))             return "linux";
  return "default";
}

export function useOS() {
  const [os,         setOS]         = useState<OS>("default");
  const [preference, setPreference] = useState<OSPreference>("auto");

  useEffect(() => {
    const stored = isBrowser ? (localStorage.getItem(STORAGE_KEY) as OSPreference | null) : null;
    const pref: OSPreference = stored ?? "auto";
    setPreference(pref);
    setOS(pref === "auto" ? detectOS() : (pref as OS));
  }, []);

  const setOSPreference = useCallback((value: OSPreference) => {
    setPreference(value);
    localStorage.setItem(STORAGE_KEY, value);
    setOS(value === "auto" ? detectOS() : (value as OS));
  }, []);

  return { os, preference, setOSPreference };
}

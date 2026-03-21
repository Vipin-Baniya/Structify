"use client";
import { useEffect, useState, useCallback } from "react";

export type OS = "macos" | "windows" | "linux" | "android" | "ios" | "default";
export type OSPreference = OS;

const STORAGE_KEY = "structify-os-theme";
const EVENT_NAME  = "structify:os-change";
const isBrowser   = typeof window !== "undefined";

export function useOS() {
  const [os,         setOS]         = useState<OS>("default");
  const [preference, setPreference] = useState<OSPreference>("default");

  useEffect(() => {
    const stored = isBrowser ? (localStorage.getItem(STORAGE_KEY) as string | null) : null;
    // If stored value is the old "auto" value, fall back to "default"
    const pref: OSPreference = (stored && stored !== "auto") ? stored as OSPreference : "default";
    setPreference(pref);
    setOS(pref);
  }, []);

  // Sync all hook instances when any one of them changes the OS preference
  useEffect(() => {
    if (!isBrowser) return;
    function handleChange(e: Event) {
      const value = (e as CustomEvent<OSPreference>).detail;
      setPreference(value);
      setOS(value);
    }
    window.addEventListener(EVENT_NAME, handleChange);
    return () => window.removeEventListener(EVENT_NAME, handleChange);
  }, []);

  const setOSPreference = useCallback((value: OSPreference) => {
    setPreference(value);
    localStorage.setItem(STORAGE_KEY, value);
    setOS(value);
    window.dispatchEvent(new CustomEvent<OSPreference>(EVENT_NAME, { detail: value }));
  }, []);

  return { os, preference, setOSPreference };
}

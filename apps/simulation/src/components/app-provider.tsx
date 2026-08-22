"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Selection } from "@/lib/types";
import { parseStoredSelection } from "@/lib/selection";

interface AppState {
  selection?: Selection;
  setSelection: (value: Selection) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelectionState] = useState<Selection>();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = parseStoredSelection(localStorage.getItem("zgx-selection"));
        if (stored) setSelectionState(stored);
        const savedTheme = localStorage.getItem("zgx-theme") as "light" | "dark" | null;
        if (savedTheme) setTheme(savedTheme);
        localStorage.removeItem("zgx-present");
      } catch { /* local storage is an enhancement */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const setSelection = (value: Selection) => { setSelectionState(value); try { localStorage.setItem("zgx-selection", JSON.stringify(value)); } catch {} };
  const toggleTheme = () => setTheme((value) => { const next = value === "dark" ? "light" : "dark"; try { localStorage.setItem("zgx-theme", next); } catch {}; return next; });
  return <Context.Provider value={{ selection, setSelection, theme, toggleTheme }}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import type { Personality } from "@/types/chat";
import { constructNow } from "date-fns";

interface UIContextType {
  personality: Personality;
  setPersonality: (personality: Personality) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [personality, setPersonalityState] = useState<Personality>("default");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ajai-personality") as Personality;
    if (saved) setPersonalityState(saved);
  }, []);

  const setPersonality = useCallback((p: Personality) => {
    setPersonality(p);
    localStorage.setItem("ajai-personality", p);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <UIContext.Provider
      value={{
        setPersonality,
        toggleSidebar,
        sidebarOpen,
        personality,
        setSidebarOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  let context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

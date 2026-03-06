"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Personality } from "@/types/chat"

interface UIContextType {
  personality: Personality
  setPersonality: (personality: Personality) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [personality, setPersonalityState] = useState<Personality>("default")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("ajai-personality") as Personality
    if (saved) setPersonalityState(saved)
  }, [])

  const setPersonality = useCallback((p: Personality) => {
    setPersonalityState(p)
    localStorage.setItem("ajai-personality", p)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return (
    <UIContext.Provider value={{ personality, setPersonality, sidebarOpen, toggleSidebar, setSidebarOpen }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}

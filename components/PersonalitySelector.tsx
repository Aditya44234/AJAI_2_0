"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUI } from "@/context/UIContext"
import type { Personality } from "@/types/chat"
import { Sparkles } from "lucide-react"

const personalities: { value: Personality; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "happy", label: "Happy" },
  { value: "hopeful", label: "Hopeful" },
  { value: "rude", label: "Rude" },
  { value: "aggressive", label: "Aggressive" },
]

export function PersonalitySelector() {
  const { personality, setPersonality } = useUI()

  return (
    <div className="px-3">
      <label className="flex items-center gap-2 text-xs text-muted-foreground mb-2 px-1">
        <Sparkles className="w-3 h-3" />
        AI Personality
      </label>
      <Select value={personality} onValueChange={(v) => setPersonality(v as Personality)}>
        <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border">
          <SelectValue placeholder="Select personality" />
        </SelectTrigger>
        <SelectContent>
          {personalities.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

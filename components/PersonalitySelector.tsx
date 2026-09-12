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
import { User  } from "lucide-react"

const personalities: { value: Personality; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "happy", label: "Happy" },
  { value: "hopeful", label: "Hopeful" },
  { value: "mentor",label:"Mentor"},
  { value: "rude", label: "Rude" },
  { value: "playboy",label:"Playboy"},
  { value: "aggressive", label: "Aggressive" },
]

export function PersonalitySelector() {
  const { personality, setPersonality } = useUI()

  return (
    <div className="px-3">
      
     
      <Select value={personality} onValueChange={(v) => setPersonality(v as Personality)} >
        <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border cursor-pointer py-6  border-4 ">
           <User  className="w-4 h-4" />
          <SelectValue placeholder="Select personality" />
        </SelectTrigger>
        
        <SelectContent >
          
          {personalities.map((p) => (
            <SelectItem key={p.value} value={p.value} className="cursor-pointer">
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

"use client"

import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex gap-3 w-full justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
        <Bot className="w-4 h-4 text-accent-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}

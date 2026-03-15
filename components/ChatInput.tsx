// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Send } from "lucide-react"

// interface ChatInputProps {
//   onSend: (message: string) => void
//   disabled?: boolean
// }

// export function ChatInput({ onSend, disabled }: ChatInputProps) {
//   const [message, setMessage] = useState("")
//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto"
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
//     }
//   }, [message])

//   const handleSubmit = () => {
//     if (message.trim() && !disabled) {
//       onSend(message.trim())
//       setMessage("")
//     }
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit()
//     }
//   }

//   return (
//     <div className="flex items-end gap-2 p-4 border-t border-border bg-card/50 backdrop-blur-sm no-scrollbar">
//       <div className="flex-1 relative">
//         <textarea
//           ref={textareaRef}
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Type a message..."
//           disabled={disabled}
//           rows={1}
//           className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
//         />
//       </div>
//       <Button
//         onClick={handleSubmit}
//         disabled={disabled || !message.trim()}
//         size="icon"
//         className="h-11 w-11 rounded-xl flex-shrink-0"
//       >
//         <Send className="w-4 h-4" />
//         <span className="sr-only">Send message</span>
//       </Button>
//     </div>
//   )
// }

"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    void Promise.resolve(onSend(message.trim())).catch((error) => {
      console.error("Failed to send message:", error);
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-6 flex justify-center px-4 md:px-8">
      <div className="w-full max-w-5xl rounded-md border border-border bg-card/80 backdrop-blur-md shadow-xl">
        <div className="flex items-end gap-4 px-6 py-4">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            className="chat-input-textarea flex-1 resize-none overflow-y-auto bg-transparent text-lg outline-none placeholder:text-muted-foreground max-h-[160px] min-h-[44px]"
          />

          {/* Personality button */}
          {/* <button className="text-base text-muted-foreground hover:text-foreground transition">
            Personality
          </button> */}

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

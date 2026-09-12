"use client";

import { ArrowUp, Plus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PersonalitySelector } from "./PersonalitySelector";
import { Button } from "./ui/button";

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = send
    // Shift + Enter = new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-2 flex justify-center px-4 md:px-8">
      <div
        className="
          w-full
          max-w-5xl
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-primary/10
          shadow-2xl
          backdrop-blur-xl
          transition-all
          duration-200
          focus-within:border-white/20
        "
      >
        {/* Text area */}
        <div className="px-5 pt-5 md:px-6 md:pt-5 ">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything."
            disabled={disabled}
            rows={1}
            className="
              block
              w-full
              resize-none
              overflow-y-auto
              bg-transparent
              text-[17px]
              leading-6 
              text-white
              outline-none
              placeholder:text-[#777]
              max-h-[120px]
              min-h-[40px]
              scrollbar-thin
            "
          />
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between px-4 pb-3 pt-2 md:px-5 md:pb-4">
          {/* Plus button */}
          <Button
            type="button"
            disabled={disabled}
            aria-label="Add attachment"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-white/70
              transition
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
              cursor-not-allowed
            "
          >
            <Plus className="h-6 w-6" strokeWidth={1.8} />
          </Button>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Persona selector */}
            <Button
              type="button"
              disabled={disabled}
              className="
                flex
                items-center
                gap-1.5
                rounded-lg
                px-2
                py-2
                text-[15px]
                text-white/80
                transition
              
        
                disabled:opacity-40
              "
            >
              {/* <span>Persona</span> */}
              <PersonalitySelector />
              {/* <ChevronDown className="h-4 w-4 text-white/50" /> */}
            </Button>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              aria-label="Send message"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-black
                transition-all
                duration-150
                hover:scale-105
                hover:bg-white/90
                active:scale-95
                disabled:cursor-not-allowed
                disabled:bg-white/20
                disabled:text-white/40
                disabled:hover:scale-100
              "
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

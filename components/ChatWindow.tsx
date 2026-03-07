"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useUI } from "@/context/UIContext";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { Bot, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWindow() {
  const { messages, isSending, sendMessage } = useChat();
  const { personality, toggleSidebar } = useUI();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (content: string) => {
    setError(null);
    try {
      await sendMessage(content, personality);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-20 h-13 rounded-full flex items-center justify-center">
            {/* <Bot className="w-4 h-4 text-primary-foreground" /> */}
            <img src="/logo.png" alt="" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">AJAI 2.0</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {personality} mode
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-46 h-46 rounded-full  flex items-center justify-center mb-4">
              {/* <Bot className="w-8 h-8 text-primary" /> */}
              <img src="/logo.png" alt="" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Welcome to AJAI 2.0</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start a conversation with your AI assistant. Ask anything and get
              intelligent responses powered by advanced AI.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isSending && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}

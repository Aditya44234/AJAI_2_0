"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";

  return (
    <div
      className={cn(
        "flex w-full gap-3   ",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "relative  px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-300",
          isUser
            ? "bg-card text-white rounded-br-md"
            : " text-card-foreground rounded-bl-md animate-message-pulse",
          "before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2",
        )}
      >
        <div className="whitespace-pre-wrap break-words text-xl">
          {isStreaming && !isUser ? (
            <>
              {message.content}
              <span className="ml-1 inline-block h-5 w-2 animate-pulse rounded-sm bg-current align-middle opacity-70" />
            </>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

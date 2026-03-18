"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { Copy, RefreshCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
  canResend?: boolean;
  onResend?: () => void | Promise<void>;
  resendDisabled?: boolean;
}

type FeedbackState = "liked" | "disliked" | null;

export function MessageBubble({
  message,
  canResend = false,
  onResend,
  resendDisabled = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyState("idle");
    }, 1800);
  };

  const handleFeedback = (nextFeedback: Exclude<FeedbackState, null>) => {
    setFeedback((currentFeedback) =>
      currentFeedback === nextFeedback ? null : nextFeedback,
    );
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3   ",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div className="flex max-w-[85%] flex-col">
        <div
          className={cn(
            "relative px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-300",
            isUser
              ? "bg-card text-white rounded-br-md"
              : "text-card-foreground rounded-bl-md animate-message-pulse",
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

        {!isUser && !isStreaming && message.content.trim() && (
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground  cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={feedback === "liked"}
              onClick={() => handleFeedback("liked")}
              className={cn(
                "h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground   cursor-pointer",
                feedback === "liked" && " text-primary  ",
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5  cursor-pointer" />
              Like
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={feedback === "disliked"}
              onClick={() => handleFeedback("disliked")}
              className={cn(
                "h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground  cursor-pointer",
                feedback === "disliked" && " text-destructive",
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5 cursor-pointer" />
              Dislike
            </Button>

            {canResend && onResend && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void onResend()}
                disabled={resendDisabled}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground cursor-pointer  hover:text-foreground"
              >
                <RefreshCcw className="h-3.5 w-3.5  cursor-pointer" />
                Resend
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

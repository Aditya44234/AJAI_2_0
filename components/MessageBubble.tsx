"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import {
  Copy,
  ExternalLink,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
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
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex max-w-full flex-col",
          isUser && "items-end",
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-300",
            isUser
              ? "max-w-[min(78vw,42rem)] rounded-br-sm border border-amber-300/20 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-950/20"
              : "rounded-bl-md text-card-foreground animate-message-pulse",
            "before:absolute before:top-1/2 before:-translate-y-1/2 before:content-['']",
          )}
        >
          <div
            className={cn(
              "whitespace-pre-wrap break-words text-xl",
              isUser && "[&_p]:m-0 [&_p]:leading-relaxed",
            )}
          >
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

        {!isUser &&
          !isStreaming &&
          Array.isArray(message.sources) &&
          message.sources.length > 0 && (
            <div className="mt-3 space-y-2 pl-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sources
              </p>

              {message.sources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-border/60 bg-card/40 px-3 py-3 transition hover:border-primary/40 hover:bg-card/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {source.title}
                      </p>
                      {/* <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {source.snippet}
                      </p>
                      <p className="mt-2 line-clamp-1 text-[11px] text-primary/90">
                        {source.url}
                      </p> */}
                    </div>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </div>
          )}

        {!isUser && !isStreaming && message.content.trim() && (
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
                "h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
                feedback === "liked" && "text-primary",
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5 cursor-pointer" />
              Like
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={feedback === "disliked"}
              onClick={() => handleFeedback("disliked")}
              className={cn(
                "h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
                feedback === "disliked" && "text-destructive",
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
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5 cursor-pointer" />
                Resend
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useUI } from "@/context/UIContext";
import { LogIn, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { UserProfileModal } from "./UserProfileModal";

export function ChatWindow() {
  const { messages, isSending, sendMessage } = useChat();
  const { personality, toggleSidebar } = useUI();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showWelcomeTyping, setShowWelcomeTyping] = useState(true);
  const [typedTitle, setTypedTitle] = useState("");
  const [typedDescription, setTypedDescription] = useState("");
  const [animateFromSidebar, setAnimateFromSidebar] = useState(false);
  const { user } = useAuth();
  const lastMessage = messages[messages.length - 1];
  const isAssistantStreaming =
    lastMessage?.role === "assistant" && lastMessage.status === "streaming";
  const latestAssistantMessageIndex = [...messages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(({ message }) => message.role === "assistant")?.index;

  useEffect(() => {
    if (messages.length === 0) {
      setShowWelcomeTyping(true);
      setTypedTitle("");
      setTypedDescription("");
    } else {
      setShowWelcomeTyping(false);
      setTypedTitle("");
      setTypedDescription("");
    }
  }, [messages.length]);

  useEffect(() => {
    if (!showWelcomeTyping) return;

    const title = "Welcome to AJAI 2.0";
    const description =
      "Start a conversation with your AI assistant. Ask anything and get intelligent responses.";

    let titleIndex = 0;
    let descriptionIndex = 0;
    const titleTimer = setInterval(() => {
      titleIndex += 1;
      setTypedTitle(title.slice(0, titleIndex));
      if (titleIndex >= title.length) {
        clearInterval(titleTimer);
        const descTimer = setInterval(() => {
          descriptionIndex += 1;
          setTypedDescription(description.slice(0, descriptionIndex));
          if (descriptionIndex >= description.length) {
            clearInterval(descTimer);
          }
        }, 16);
      }
    }, 35);

    return () => {
      clearInterval(titleTimer);
    };
  }, [showWelcomeTyping]);

  useEffect(() => {
    setAnimateFromSidebar(true);
    const timeout = setTimeout(() => setAnimateFromSidebar(false), 450);
    return () => clearTimeout(timeout);
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isAssistantStreaming ? "auto" : "smooth",
      });
    }
  }, [messages, isAssistantStreaming]);

  const handleSend = async (content: string) => {
    setError(null);
    try {
      await sendMessage(content, personality);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleResend = async (messageIndex: number) => {
    if (isSending) {
      return;
    }

    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((message) => message.role === "user");

    if (!previousUserMessage?.content) {
      setError("Could not find the prompt for this response");
      return;
    }

    await handleSend(previousUserMessage.content);
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3  border-border bg-card/50 backdrop-blur-sm ">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex items-center gap-2 md:hidden lg:hidden ">
          <div className="w-20 h-13 rounded-full flex items-center justify-center">
            <img src="/logo.png" alt="" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">AJAI 2.0</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {personality} mode
            </p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center">
          {user ? (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary text-sm font-semibold uppercase text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar sm:h-11 sm:w-11 cursor-pointer
              "
              aria-label="Open user profile"
            >
              <span className="sr-only">{user.name}</span>
              <div className="flex h-full w-full items-center justify-center rounded-full">
                {user.name.slice(0, 1)}
              </div>
            </button>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="chat-scroll-container flex-1 overflow-y-auto  pb-40 space-y-4  w-full max-w-5xl justify-center m-auto py-2"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center  h-full text-center px-4 animate-fade-in-up">
            <div className="w-3xs h-46 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
              <img src="/logo.png" alt="" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-white">
              {typedTitle || "Welcome to AJAI 2.0"}
              <span className="text-primary">|</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {typedDescription ||
                "Start a conversation with your AI assistant. Ask anything and get intelligent responses."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={`${msg.createdAt}-${i}`}
                className={`animate-slide-in-right justify-center  ${
                  animateFromSidebar ? "opacity-100" : "opacity-100"
                }`}
              >
                <MessageBubble
                  message={msg}
                  canResend={
                    msg.role === "assistant" && i === latestAssistantMessageIndex
                  }
                  onResend={() => handleResend(i)}
                  resendDisabled={isSending}
                />
              </div>
            ))}
            {isSending && !isAssistantStreaming && <TypingIndicator />}
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

      {user && (
        <UserProfileModal
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          user={user}
          personality={personality}
        />
      )}
    </div>
  );
}

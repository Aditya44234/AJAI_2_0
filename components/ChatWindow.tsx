"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useUI } from "@/context/UIContext";
import { LogIn, Menu, PanelLeft, PanelLeftClose, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { UserProfileModal } from "./UserProfileModal";

export function ChatWindow() {
  const { messages, isSending, isSearching, searchQuery, sendMessage } =
    useChat();
  const { personality, sidebarOpen, toggleSidebar } = useUI();
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
      "Start a conversation with your AI assistant. Ask anything .";

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
  }, [messages, isAssistantStreaming, isSearching]);

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
    <div className="relative flex h-full flex-col">
      <header className="flex items-center gap-3 border-border bg-card/50 px-4 py-3 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
          <span className="sr-only">
            {sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          </span>
        </Button>

        <div className="flex items-center gap-2 md:hidden lg:hidden">
          <div className="w-20 h-13 rounded-full flex items-center justify-center">
            <img src="/logo.png" alt="" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">AJAI 2.0</h1>
            <p className="text-xs capitalize text-muted-foreground">
              {personality} mode
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center">
          {user ? (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-primary/30 bg-primary text-sm font-semibold uppercase text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar sm:h-11 sm:w-11"
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

      <div
        ref={scrollRef}
        className="chat-scroll-container m-auto flex-1 space-y-4 overflow-y-auto py-2 pb-40 w-full max-w-5xl justify-center"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center px-4 text-center animate-fade-in-up">
            <div className="w-3xs h-46 mb-4 flex items-center justify-center rounded-full animate-bounce-slow">
              <img src="/logo.png" alt="" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white">
              {typedTitle || "Welcome to AJAI 2.0"}
              <span className="text-primary">|</span>
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {typedDescription ||
                "Start a conversation with your AI assistant. Ask anything."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={`${msg.createdAt}-${i}`}
                className={`animate-slide-in-right justify-center ${
                  animateFromSidebar ? "opacity-100" : "opacity-100"
                }`}
              >
                <MessageBubble
                  message={msg}
                  canResend={
                    msg.role === "assistant" &&
                    i === latestAssistantMessageIndex
                  }
                  onResend={() => handleResend(i)}
                  resendDisabled={isSending}
                />
              </div>
            ))}

            {isSearching && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-primary/20 bg-card/60 px-4 py-3 text-sm text-card-foreground shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Search className="h-4 w-4 animate-pulse text-primary" />
                    Searching the web
                  </div>
                  {searchQuery && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Query: {searchQuery}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isSending && !isAssistantStreaming && !isSearching && (
              <TypingIndicator />
            )}
          </>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </div>
      )}

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

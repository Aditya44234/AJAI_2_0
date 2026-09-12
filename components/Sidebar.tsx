"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useUI } from "@/context/UIContext";
import { cn } from "@/lib/utils";
import {
  Clock4,
  LogIn,
  LogOut,
  MoreVertical,
  Pin,
  PinIcon,
  PinOff,
  Plus,
  Trash2,
  X,
  MessageSquarePlus
} from "lucide-react";
import { useEffect, useState } from "react";
import { PersonalitySelector } from "./PersonalitySelector";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const {
    chatList,
    currentChatId,
    isChatListLoading,
    loadChatList,
    startNewChat,
    deleteChat,
    togglePinChat,
  } = useChat();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const router = useRouter();

  useEffect(() => {
    void loadChatList().catch(() => {
      // Leave the sidebar empty if chat history cannot be loaded.
    });
  }, [loadChatList]);

  const handleChatClick = (chatId: string) => {
    // void loadChat(chatId).catch(() => {
    //   // Ignore chat load failures here to avoid unhandled promise rejections.
    // });
    router.push(`/chat/${chatId}`);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    void logout().catch(() => {
      // Keep the current UI state if logout fails.
    });
  };

  const handleNewChat = () => {
    startNewChat();
    router.push("/");
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Header */}
      
      <div className="flex items-center justify-between p-4  ">
        <div className="flex items-center gap-2">
          <div
            className="w-20 h-15 rounded-lg  flex items-center justify-center cursor-pointer"
            onClick={handleNewChat}
          >
            <img src="/logo.png" alt="" />
          </div>
          <span className="font-semibold text-sidebar-foreground text-2xl">
            AJAI 2.0
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            {/* <PanelLeftClose className="w-5 h-5" /> */}
            <span className="sr-only">Collapse sidebar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </div>

      <div className="p-3">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="
      group
      w-full
      h-11
      justify-start
      gap-3
      rounded-xl
      border-white/10
      bg-white/[0.03]
      px-4
      text-sm
      font-medium
      text-foreground/80
      shadow-sm
      transition-all
      duration-200
      hover:border-white/15
      hover:bg-white/[0.08]
      hover:text-foreground
      hover:shadow-md
      active:scale-[0.98]
      cursor-pointer
    "
        >
          <span
            className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-lg
        bg-white/[0.08]
        text-muted-foreground
        transition-colors
        duration-200
        group-hover:bg-white/[0.12]
        group-hover:text-foreground
      "
          >
            <MessageSquarePlus className="h-4 w-4" strokeWidth={2} />
          </span>

          <span>New Chat</span>
        </Button>
      </div>

      {/* <PersonalitySelector /> */}

      <div className="flex-1 overflow-hidden mt-4">
        <div className=" flex px-4 mb-2 mt-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex gap-3 items-center ">
            <Clock4 className="w-5 h-5" />
            Chat History
          </span>
        </div>
        <ScrollArea className="h-full px-3">
          <div className="space-y-1 pb-4 ">
            {isChatListLoading && chatList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <Spinner className="size-8 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    Fetching chat history...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Loading your recent conversations.
                  </p>
                </div>
              </div>
            ) : chatList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-2">
                No chats yet. Start a new conversation!
              </p>
            ) : (
              <>
                {isChatListLoading && (
                  <div className="mb-3 flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                    <Spinner className="size-4 text-primary" />
                    Fetching chat history...
                  </div>
                )}
                {chatList.map((chat) => (
                  <div
                    key={chat.chatId}
                    className={cn(
                      "group relative w-full rounded-lg  bg-card transition-all overflow-visible flex items-center justify-between cursor-pointer hover:bg-sidebar-accent",
                      currentChatId === chat.chatId
                        ? "bg-sidebar-accent"
                        : "bg-sidebar",
                    )}
                    onClick={() => handleChatClick(chat.chatId)}
                  >
                    <div className="flex">
                      <button className="flex-1 flex items-center gap-2 px-2 py-5 text-left rounded-lg cursor-pointer">
                        <div className="min-w-0 flex">
                          <p className="font-medium truncate text-sidebar-foreground">
                            {chat.title}
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="flex justify-center items-center">
                      {chat.pinned && (
                        <PinIcon className="w-4 h-4 text-muted-foreground" />
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === chat.chatId ? null : chat.chatId,
                          );
                        }}
                        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        aria-label="Open chat actions"
                      >
                        <MoreVertical
                          className={cn(
                            "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
                          )}
                        />
                      </button>
                    </div>

                    {openMenuId === chat.chatId && (
                      <div className="absolute right-2 top-12 z-50 w-44 rounded-lg border border-border bg-background p-2 shadow-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            void togglePinChat(chat.chatId, !chat.pinned);
                          }}
                          className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted cursor-pointer"
                        >
                          {chat.pinned ? (
                            <PinOff className="w-3.5 h-3.5 cursor-pointer" />
                          ) : (
                            <Pin className="w-3.5 h-3.5 cursor-pointer" />
                          )}
                          {chat.pinned ? "Unpin chat" : "Pin chat"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            void deleteChat(chat.chatId);
                          }}
                          className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {!user && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary">
            Login to save unlimited chats and access your history from any
            device.
          </p>
        </div>
      )}

      <div className="p-3 border-t border-sidebar-border">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground  cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 cursor-pointer
              
              "
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </Button>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed z-50 flex h-full w-72 flex-col bg-sidebar border-sidebar-border transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      <div
        className={cn(
          "relative hidden shrink-0 overflow-hidden transition-[width] duration-300 md:block",
          sidebarOpen ? "w-72" : "w-0",
        )}
      >
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-30 flex h-full w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}

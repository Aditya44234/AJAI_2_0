"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { PersonalitySelector } from "./PersonalitySelector";

import Link from "next/link";

export function Sidebar() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const {
    chatList,
    currentChatId,
    loadChatList,
    loadChat,
    startNewChat,
    deleteChat,
    togglePinChat,
  } = useChat();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUI();

  useEffect(() => {
    void loadChatList().catch(() => {
      // Leave the sidebar empty if chat history cannot be loaded.
    });
  }, [loadChatList]);

  const handleChatClick = (chatId: string) => {
    void loadChat(chatId).catch(() => {
      // Ignore chat load failures here to avoid unhandled promise rejections.
    });
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    void logout().catch(() => {
      // Keep the current UI state if logout fails.
    });
  };

  const handleNewChat = () => {
    startNewChat();
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 flex flex-col h-full w-72 bg-sidebar  border-sidebar-border transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center gap-2">
            <div
              className="w-20 h-15 rounded-lg  flex items-center justify-center cursor-pointer"
              onClick={handleNewChat}
            >
              {/* <Bot className="w-4 h-4 text-primary-foreground" /> */}
              <img src="/logo.png" alt="" />
            </div>
            <span className="font-semibold text-sidebar-foreground text-2xl">
              AJAI 2.0
            </span>
          </div>
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

        {/* New Chat Button */}
        <div className="p-3 cursor-pointer ">
          <Button
            onClick={handleNewChat}
            className="w-full flex  justify-between  gap-2 cursor-pointer border-4"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            New Chat
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Personality Selector */}
        <PersonalitySelector />

        {/* Chat List */}
        <div className="flex-1 overflow-hidden mt-4">
          <div className=" flex px-4 mb-2 mt-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex gap-3 items-center ">
              <Clock4 className="w-5 h-5" />
              Chat History
            </span>
          </div>
          <ScrollArea className="h-full px-3">
            <div className="space-y-1 pb-4 ">
              {chatList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 px-2">
                  No chats yet. Start a new conversation!
                </p>
              ) : (
                chatList.map((chat) => (
                  <div
                    key={chat.chatId}
                    className={cn(
                      "relative w-full  rounded-lg border-t-4   bg-card transition-all overflow-visible flex items-center justify-between  cursor-pointer  hover:bg-sidebar-accent  ",
                      currentChatId === chat.chatId
                        ? "bg-sidebar-accent"
                        : "bg-sidebar",
                    )}
                    onClick={() => handleChatClick(chat.chatId)}
                  >
                    <div className="flex ">
                      <button className="flex-1 flex  items-center gap-2 px-2 py-5 text-left rounded-lg cursor-pointer">
                        {/* <MessageSquare className="w-4 h-4 text-muted-foreground" /> */}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-sidebar-foreground">
                            {chat.title}
                          </p>
                          {/* <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {chat.lastMessage ? `${chat.lastMessage.slice(0, 24)}...` : "No messages yet"}
                          </div> */}
                        </div>
                      </button>
                    </div>

                    <div className="flex justify-center items-center   ">
                      {/*  Show whether pinned or not  */}
                      {chat.pinned && (
                        <PinIcon className="w-4 h-4 text-muted-foreground" />
                      )}

                      {/*  More icon button to see the delete and Pon options for chat  */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === chat.chatId ? null : chat.chatId,
                          );
                        }}
                        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground  cursor-pointer"
                        aria-label="Open chat actions"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground " />
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
                          className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted  cursor-pointer"
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
                          className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10  cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Temp user banner */}
        {!user && (
          <div className="mx-3 mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary">
              Login to save unlimited chats and access your history from any
              device.
            </p>
          </div>
        )}

        {/* User Section */}
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
      </aside>
    </>
  );
}

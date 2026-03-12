"use client";

import { useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { PersonalitySelector } from "./PersonalitySelector";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, MessageSquare, LogOut, LogIn, X, Bot } from "lucide-react";

import Link from "next/link";

export function Sidebar() {
  const { chatList, currentChatId, loadChatList, loadChat, startNewChat } =
    useChat();
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
          "fixed md:relative z-50 flex flex-col h-full w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center gap-2">
            <div
              className="w-18 h-10 rounded-lg  flex items-center justify-center cursor-pointer"
              onClick={handleNewChat}
            >
              {/* <Bot className="w-4 h-4 text-primary-foreground" /> */}
              <img src="/logo.png" alt="" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
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
          <div className="px-4 mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Recent Chats
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
                  <button
                    key={chat.chatId}
                    onClick={() => handleChatClick(chat.chatId)}
                    className={cn(
                      "w-full flex items-start gap-2 p-2 rounded-lg text-left text-sm transition-colors hover:bg-sidebar-accent cursor-pointer border-b-2 ",
                      currentChatId === chat.chatId && "bg-sidebar-accent",
                    )}
                  >
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-sidebar-foreground">
                        {chat.title}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage.slice(0, 25)}.........
                        </p>
                      )}
                    </div>
                  </button>
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
              <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer
              
              ">
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

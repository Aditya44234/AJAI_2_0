"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import type { Chat, Message, Personality } from "@/types/chat";
import * as api from "@/services/api";

import { useParams, useRouter } from "next/navigation";

const STREAM_RENDER_INTERVAL_MS = 28;
const STREAM_RENDER_CHARS_PER_TICK = 18;
const STREAM_RENDER_INITIAL_BURST = 12;

interface ChatContextType {
  chatList: Chat[];
  currentChatId: string | null;
  messages: Message[];
  isChatListLoading: boolean;
  isLoading: boolean;
  isSending: boolean;
  loadChatList: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string, personality: Personality) => Promise<void>;
  startNewChat: () => void;
  deleteChat: (chatId: string) => Promise<void>;
  togglePinChat: (chatId: string, pinned: boolean) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function updateLastAssistantMessage(
  messages: Message[],
  transform: (message: Message) => Message | null,
) {
  const lastMessageIndex = messages.length - 1;
  const lastMessage = messages[lastMessageIndex];

  if (lastMessageIndex < 0 || lastMessage.role !== "assistant") {
    return messages;
  }

  const updatedMessage = transform(lastMessage);

  if (!updatedMessage) {
    return messages.slice(0, -1);
  }

  const nextMessages = [...messages];
  nextMessages[lastMessageIndex] = updatedMessage;
  return nextMessages;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatListLoading, setIsChatListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const params = useParams<{ chatId?: string }>();
  const router = useRouter();
  const routeChatId = typeof params.chatId === "string" ? params.chatId : null;

  const loadChatList = useCallback(async () => {
    setIsChatListLoading(true);
    try {
      const chats = await api.getChatList();
      setChatList(chats);
    } finally {
      setIsChatListLoading(false);
    }
  }, []);

  const loadChat = useCallback(async (chatId: string) => {
    setIsLoading(true);
    try {
      const chat = await api.getChatMessages(chatId);
      if (chat) {
        setCurrentChatId(chat.chatId);
        setMessages(chat.messages);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Around 100 lines of code just for single function to send the query
  const sendMessage = useCallback(
    async (content: string, personality: Personality) => {
      let pendingAssistantText = "";
      let hasRenderedFirstChunk = false;
      let streamFinished = false;
      let drainResolver: (() => void) | null = null;
      let displayTimer: ReturnType<typeof setInterval> | null = null;
      let didRouteToNewChat = false;

      const assistantTimestamp = new Date().toISOString();

      const appendAssistantText = (text: string) => {
        if (!text) return;

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];

          if (
            lastMessage?.role === "assistant" &&
            lastMessage.status === "streaming"
          ) {
            return updateLastAssistantMessage(prev, (message) => ({
              ...message,
              content: message.content + text,
              status: "streaming",
            }));
          }

          return [
            ...prev,
            {
              role: "assistant",
              content: text,
              createdAt: assistantTimestamp,
              status: "streaming",
            },
          ];
        });
      };

      const finalizeDrainIfReady = () => {
        if (!streamFinished || pendingAssistantText || displayTimer) {
          return;
        }

        if (drainResolver) {
          drainResolver();
          drainResolver = null;
        }
      };

      const stopDisplayTimer = () => {
        if (displayTimer) {
          clearInterval(displayTimer);
          displayTimer = null;
        }

        finalizeDrainIfReady();
      };

      const startDisplayTimer = () => {
        if (displayTimer || !pendingAssistantText) {
          finalizeDrainIfReady();
          return;
        }

        displayTimer = setInterval(() => {
          if (!pendingAssistantText) {
            stopDisplayTimer();
            return;
          }

          const nextText = pendingAssistantText.slice(
            0,
            STREAM_RENDER_CHARS_PER_TICK,
          );
          pendingAssistantText = pendingAssistantText.slice(nextText.length);
          appendAssistantText(nextText);

          if (!pendingAssistantText) {
            stopDisplayTimer();
          }
        }, STREAM_RENDER_INTERVAL_MS);
      };

      const queueAssistantText = (text: string) => {
        if (!text) return;

        pendingAssistantText += text;

        if (!hasRenderedFirstChunk) {
          const initialText = pendingAssistantText.slice(
            0,
            STREAM_RENDER_INITIAL_BURST,
          );
          pendingAssistantText = pendingAssistantText.slice(initialText.length);
          appendAssistantText(initialText);
          hasRenderedFirstChunk = true;
        }

        startDisplayTimer();
      };

      const waitForDisplayDrain = async () => {
        streamFinished = true;

        if (!pendingAssistantText && !displayTimer) {
          return;
        }

        await new Promise<void>((resolve) => {
          drainResolver = resolve;
        });
      };

      const timestamp = new Date().toISOString();
      const userMessage: Message = {
        role: "user",
        content,
        createdAt: timestamp,
        status: "done",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);

      try {
        const response = await api.sendMessageStream(
          content,
          currentChatId || undefined,
          personality,
          {
            onMeta: (event) => {
              if (event.chatId) {
                setCurrentChatId(event.chatId);
                if (!currentChatId && !didRouteToNewChat) {
                  didRouteToNewChat = true;
                  router.replace(`/chat/${event.chatId}`);
                }
              }
            },
            onDelta: (text) => {
              queueAssistantText(text);
            },
          },
        );

        if (response.chatId) {
          setCurrentChatId(response.chatId);
        }

        await waitForDisplayDrain();

        setMessages((prev) =>
          updateLastAssistantMessage(prev, (message) =>
            message.content
              ? {
                  ...message,
                  status: "done",
                }
              : null,
          ),
        );
      } catch (error) {
        await waitForDisplayDrain();

        setMessages((prev) =>
          updateLastAssistantMessage(prev, (message) =>
            message.content
              ? {
                  ...message,
                  status: "done",
                }
              : null,
          ),
        );
        throw error;
      } finally {
        setIsSending(false);
        await loadChatList().catch(() => undefined);
      }
    },
    [currentChatId, loadChatList, router],
  );

  const startNewChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
  }, []);

  useEffect(() => {
    if (!routeChatId) {
      startNewChat();
      return;
    }

    void loadChat(routeChatId).catch(() => {
      router.replace("/");
    });
  }, [routeChatId, loadChat, startNewChat, router]);

  const deleteChat = useCallback(
    async (chatId: string) => {
      await api.deleteChat(chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
        router.replace("/");
      }

      await loadChatList();
    },
    [currentChatId, loadChatList, router],
  );

  const togglePinChat = useCallback(
    async (chatId: string, pinned: boolean) => {
      await api.setChatPinned(chatId, pinned);
      await loadChatList();
    },
    [loadChatList],
  );

  return (
    <ChatContext.Provider
      value={{
        chatList,
        currentChatId,
        messages,
        isChatListLoading,
        isLoading,
        isSending,
        loadChatList,
        loadChat,
        sendMessage,
        startNewChat,
        deleteChat,
        togglePinChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

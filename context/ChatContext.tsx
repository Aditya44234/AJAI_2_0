"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Chat, Message, Personality } from "@/types/chat"
import * as api from "@/services/api"

interface ChatContextType {
  chatList: Chat[]
  currentChatId: string | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  loadChatList: () => Promise<void>
  loadChat: (chatId: string) => Promise<void>
  sendMessage: (content: string, personality: Personality) => Promise<void>
  startNewChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatList, setChatList] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const loadChatList = useCallback(async () => {
    const chats = await api.getChatList()
    setChatList(chats)
  }, [])

  const loadChat = useCallback(async (chatId: string) => {
    setIsLoading(true)
    try {
      const chat = await api.getChatMessages(chatId)
      if (chat) {
        setCurrentChatId(chat.chatId)
        setMessages(chat.messages)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (content: string, personality: Personality) => {
    // Add user message immediately
    const userMessage: Message = { role: "user", content, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMessage])
    setIsSending(true)

    try {
      const response = await api.sendMessage(content, currentChatId || undefined, personality)
      
      // Update chatId if this is a new chat
      if (!currentChatId) {
        setCurrentChatId(response.chatId)
      }

      // Add AI response
      const aiMessage: Message = { role: "assistant", content: response.reply, createdAt: new Date().toISOString() }
      setMessages(prev => [...prev, aiMessage])

      // Refresh chat list
      await loadChatList()
    } catch (error) {
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1))
      throw error
    } finally {
      setIsSending(false)
    }
  }, [currentChatId, loadChatList])

  const startNewChat = useCallback(() => {
    setCurrentChatId(null)
    setMessages([])
  }, [])

  return (
    <ChatContext.Provider value={{
      chatList,
      currentChatId,
      messages,
      isLoading,
      isSending,
      loadChatList,
      loadChat,
      sendMessage,
      startNewChat,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
  createdAt?: string
  status?: "streaming" | "done"
}

export interface Chat {
  chatId: string
  title: string
  createdAt: string
  lastMessage?: string
  pinned?: boolean
}

export interface ChatDetails {
  chatId: string
  title: string
  messages: Message[]
}

export type Personality = "default" | "rude" | "hopeful" | "aggressive" | "happy" | "mentor"

export interface SendMessageStreamResult {
  chatId?: string
  reply: string
  provider?: string
}

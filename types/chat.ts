export interface Message {
  role: "user" | "assistant"
  content: string
  createdAt?: string
}

export interface Chat {
  chatId: string
  title: string
  createdAt: string
  lastMessage?: string
  pinned?:boolean
}

export interface ChatDetails {
  chatId: string
  title: string
  messages: Message[]
}

export type Personality = "default" | "rude" | "hopeful" | "aggressive" | "happy" |"mentor"

export interface SendMessageResponse {
  chatId: string
  reply: string
  provider: "Gemini" | "Groq"
}

import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/user"
import type { Chat, ChatDetails, SendMessageStreamResult, Personality } from "@/types/chat"

interface StreamMetaEvent {
  type: "meta"
  chatId?: string
  provider?: string
  personality?: Personality
}

interface StreamDeltaEvent {
  type: "delta"
  text: string
}

interface StreamDoneEvent {
  type: "done"
  chatId?: string
  provider?: string
}

interface StreamErrorEvent {
  type: "error"
  message: string
}

type StreamEvent =
  | StreamMetaEvent
  | StreamDeltaEvent
  | StreamDoneEvent
  | StreamErrorEvent

interface SendMessageStreamOptions {
  onMeta?: (event: StreamMetaEvent) => void
  onDelta?: (text: string) => void
}

function parseStreamEvent(line: string): StreamEvent {
  return JSON.parse(line) as StreamEvent
}

async function handleStreamEvent(
  event: StreamEvent,
  result: SendMessageStreamResult,
  options?: SendMessageStreamOptions,
) {
  if (event.type === "meta") {
    if (event.chatId) result.chatId = event.chatId
    if (event.provider) result.provider = event.provider
    options?.onMeta?.(event)
    return
  }

  if (event.type === "delta") {
    result.reply += event.text
    options?.onDelta?.(event.text)
    return
  }

  if (event.type === "done") {
    if (event.chatId) result.chatId = event.chatId
    if (event.provider) result.provider = event.provider
    return
  }

  throw new Error(event.message || "Failed to send message")
}

// Auth API
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Login failed")
  }
  return res.json()
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Registration failed")
  }
  return res.json()
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" })
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me")
  if (!res.ok) return null
  const data = await res.json()
  return data.user || null
}

// Chat API
export async function getChatList(): Promise<Chat[]> {
  const res = await fetch("/api/chat/list")
  if (!res.ok) return []
  return res.json()
}

export async function getChatMessages(chatId: string): Promise<ChatDetails | null> {
  const res = await fetch(`/api/chat/${chatId}`)
  if (!res.ok) return null
  return res.json()
}

export async function sendMessageStream(
  message: string,
  chatId?: string,
  personality?: Personality,
  options?: SendMessageStreamOptions,
): Promise<SendMessageStreamResult> {
  const res = await fetch("/api/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chatId, personality }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to send message")
  }

  if (!res.body) {
    throw new Error("Streaming response body is missing")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const result: SendMessageStreamResult = {
    chatId,
    reply: "",
  }
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      const event = parseStreamEvent(trimmedLine)
      await handleStreamEvent(event, result, options)
    }
  }

  const trailingLine = buffer.trim()
  if (trailingLine) {
    const event = parseStreamEvent(trailingLine)
    await handleStreamEvent(event, result, options)
  }

  return result
}

export async function deleteChat(chatId: string): Promise<void> {
  const res = await fetch(`/api/chat/${chatId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Delete chat failed");
  }
}

export async function setChatPinned(chatId: string, pinned: boolean): Promise<void> {
  const res = await fetch(`/api/chat/${chatId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pinned }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Pin/unpin failed");
  }
}

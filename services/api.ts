import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/user"
import type { Chat, ChatDetails, SendMessageResponse, Personality } from "@/types/chat"

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

export async function sendMessage(
  message: string,
  chatId?: string,
  personality?: Personality
): Promise<SendMessageResponse> {
  const res = await fetch("/api/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chatId, personality }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to send message")
  }
  return res.json()
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

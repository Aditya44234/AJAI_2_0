export interface SearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  score?: number;
  publishedDate?: string;
}

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  status?: "streaming" | "done";
  sources?: SearchSource[];
}

export interface Chat {
  chatId: string;
  title: string;
  createdAt: string;
  lastMessage?: string;
  pinned?: boolean;
}

export interface ChatDetails {
  chatId: string;
  title: string;
  messages: Message[];
}

export type Personality =
  | "default"
  | "rude"
  | "hopeful"
  | "aggressive"
  | "happy"
  | "mentor"
  | "jester";

export interface SendMessageStreamResult {
  chatId?: string;
  reply: string;
  provider?: string;
  sources?: SearchSource[];
}

export interface SearchStreamMeta {
  isSearching: boolean;
  searchQuery?: string;
  sources?: SearchSource[];
}

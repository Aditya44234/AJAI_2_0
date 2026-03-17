export type LLMRole = "system" | "user" | "assistant";

export interface LLMMessage {
    role: LLMRole;
    content: string;
}


export interface LLMProvider {
    name: string;
    streamMessage(messages: LLMMessage[]): Promise<AsyncIterable<string>>;
}

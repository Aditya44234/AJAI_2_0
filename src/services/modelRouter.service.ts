import { LLMMessage } from "../types/llm";
import { LLM_PROVIDERS } from "../llms";

export async function generateAIResponseStream(
    messages: LLMMessage[]
): Promise<{ stream: AsyncIterable<string>; provider: string }> {
    let lastError: unknown = null;

    for (const provider of LLM_PROVIDERS) {
        try {
            const stream = await provider.streamMessage(messages);
            return {
                stream,
                provider: provider.name,
            };
        } catch (error) {
            lastError = error;
        }
    }

    if (lastError instanceof Error) {
        throw lastError;
    }

    throw new Error("All AI providers failed");
}

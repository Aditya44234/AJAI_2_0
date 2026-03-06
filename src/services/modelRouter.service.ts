import { LLMMessage } from "../types/llm";
import { LLM_PROVIDERS } from "../llms";

export async function generateAIResponses(
    messages: LLMMessage[]
): Promise<{ reply: string; provider: string }> {
    let lastError: any = null;

    for (const provider of LLM_PROVIDERS) {
        try {
            const reply = await provider.sendMessage(messages);
            console.log("Reply from model :- ", reply)
            console.log(`Message replied by ${provider.name}`)
            return {
                reply,
                provider: provider.name,
            }
        } catch (error) {
            console.error(`❌ ${provider.name} failed`, error);
            lastError = error;
            continue;
        }
    }
    throw new Error("All AI providers failed")
}
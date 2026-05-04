import { buildSearchContext } from "@/src/services/sourceFormatter.service";
import { generateAIResponseStream } from "@/src/services/modelRouter.service";
import type { LLMMessage } from "@/src/types/llm";
import type { GroundedAnswerResult, SearchSource } from "@/src/types/search";

function buildGroundedMessages(
    messages: LLMMessage[],
    sources: SearchSource[],
): LLMMessage[] {
    const searchContext = buildSearchContext(sources);
    const systemMessage = messages.find((message) => message.role === "system");

    const groundedSystemMessage: LLMMessage = {
        role: "system",
        content: [
            systemMessage?.content ?? "You are a helpful AI assistant.",
            "",
            "You have been given web search sources to help answer the user's question.",
            "Use the sources to produce a natural, direct, and helpful answer.",
            "Do not answer in a robotic source-report style.",
            "Do not say things like 'According to Source 1' or 'Based on Source 2' unless the user explicitly asks for sources.",
            "Write the final answer as a normal assistant response first.",
            "Use the web sources silently in the background to improve factual accuracy.",
            "If the sources clearly conflict, briefly mention the conflict in a natural way.",
            "If the sources are insufficient, say so clearly and honestly.",
            "Do not invent facts that are not supported by the provided sources.",
            "Only mention source names or URLs when genuinely useful or when the user asks for them.",
            "",
            "Web sources:",
            searchContext,
        ].join("\n"),
    };


    const nonSystemMessages = messages.filter((message) => message.role !== "system");

    return [groundedSystemMessage, ...nonSystemMessages];
}

export async function generateGroundedAnswerStream(
    messages: LLMMessage[],
    sources: SearchSource[],
): Promise<GroundedAnswerResult> {
    const groundedMessages = buildGroundedMessages(messages, sources);
    const { stream, provider } = await generateAIResponseStream(groundedMessages);

    return {
        stream,
        provider,
        sources,
    };
}

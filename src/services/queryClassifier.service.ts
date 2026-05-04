import { SEARCH_DECISION_FALLBACK } from "@/src/config/search";
import type { LLMMessage } from "@/src/types/llm";
import type { SearchDecision } from "@/src/types/search";
import { generateModelText } from "@/src/services/modelRouter.service";

function getLatestUserMessage(messages: LLMMessage[]): string {
    const latestUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === "user");

    return latestUserMessage?.content?.trim() ?? "";
}



function buildClassifierPrompt(userMessage: string): string {
    return `
You are a search decision engine for an AI assistant.

Your task is to decide whether the user's request needs fresh or up-to-date information from the internet.

Return ONLY valid JSON with this exact shape:
{
  "needsSearch": boolean,
  "searchQuery": string,
  "reason": string,
  "freshness": "stable" | "recent" | "breaking"
}

Rules:
- needsSearch must be true if the question depends on current facts, recent events, live rankings, prices, recent laws, current leaders, recent sports, or anything likely to have changed after model training.
- needsSearch must be false for timeless explanations, math, programming help, writing help, reasoning, and historical facts that do not depend on the latest updates.
- searchQuery should be empty if needsSearch is false.
- If needsSearch is true, rewrite the user's request into the best short web search query.
- Return JSON only. No markdown. No explanation outside JSON.

User message:
${userMessage}
  `.trim();
}

function parseSearchDecision(raw: string): SearchDecision {
    const parsed = JSON.parse(raw) as Partial<SearchDecision>;

    if (
        typeof parsed.needsSearch !== "boolean" ||
        typeof parsed.searchQuery !== "string" ||
        typeof parsed.reason !== "string" ||
        (parsed.freshness !== "stable" &&
            parsed.freshness !== "recent" &&
            parsed.freshness !== "breaking")
    ) {
        throw new Error("Invalid classifier JSON shape");
    }

    return {
        needsSearch: parsed.needsSearch,
        searchQuery: parsed.searchQuery.trim(),
        reason: parsed.reason.trim(),
        freshness: parsed.freshness,
    };
}

export async function classifyQueryForSearch(
    messages: LLMMessage[],
): Promise<SearchDecision> {
    const userMessage = getLatestUserMessage(messages);

    if (!userMessage) {
        return SEARCH_DECISION_FALLBACK;
    }

    try {
        const prompt = buildClassifierPrompt(userMessage);
        const raw = await generateModelText(prompt);
        return parseSearchDecision(raw);
    } catch {
        return SEARCH_DECISION_FALLBACK;
    }
}

import {
  SEARCH_RESULT_LIMIT,
  SEARCH_TIMEOUT_MS,
} from "@/src/config/search";
import type {
  TavilyRawResult,
  TavilySearchResponse,
} from "@/src/types/search";

function getTavilyApiKey(): string {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing from environment variables");
  }

  return apiKey;
}

function normalizeTavilyResults(payload: TavilySearchResponse): TavilyRawResult[] {
  if (!Array.isArray(payload.results)) {
    return [];
  }

  return payload.results
    .filter((result) => result.url && result.title)
    .map((result) => ({
      title: result.title ?? "",
      url: result.url ?? "",
      content: result.content ?? "",
      score: result.score,
      published_date: result.published_date,
    }));
}

export async function searchWeb(query: string): Promise<TavilyRawResult[]> {
  if (!query.trim()) {
    return [];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: getTavilyApiKey(),
        query,
        max_results: SEARCH_RESULT_LIMIT,
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Tavily search failed with status ${response.status}${errorText ? `: ${errorText}` : ""}`,
      );
    }

    const payload = (await response.json()) as TavilySearchResponse;
    return normalizeTavilyResults(payload);
  } finally {
    clearTimeout(timeout);
  }
}

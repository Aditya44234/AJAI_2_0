import {
    SEARCH_CONTENT_MAX_CHARS,
    SEARCH_SNIPPET_MAX_CHARS,
} from "@/src/config/search";
import type { SearchSource, TavilyRawResult } from "@/src/types/search";

function trimText(text: string, maxChars: number): string {
    const normalized = text.replace(/\s+/g, " ").trim();

    if (normalized.length <= maxChars) {
        return normalized;
    }

    return `${normalized.slice(0, maxChars).trim()}...`;
}

function dedupeByUrl(results: TavilyRawResult[]): TavilyRawResult[] {
    const seen = new Set<string>();

    return results.filter((result) => {
        const url = result.url?.trim();
        if (!url || seen.has(url)) {
            return false;
        }

        seen.add(url);
        return true;
    });
}

export function formatSearchSources(results: TavilyRawResult[]): SearchSource[] {
    return dedupeByUrl(results).map((result, index) => {
        const content = trimText(result.content ?? "", SEARCH_CONTENT_MAX_CHARS);
        const snippet = trimText(content, SEARCH_SNIPPET_MAX_CHARS);

        return {
            id: `source-${index + 1}`,
            title: result.title?.trim() || "Untitled source",
            url: result.url?.trim() || "",
            snippet,
            score: result.score,
            publishedDate: result.published_date,
        };
    });
}

export function buildSearchContext(sources: SearchSource[]): string {
    if (sources.length === 0) {
        return "No web sources were found.";
    }

    return sources
        .map((source, index) => {
            const publishedLine = source.publishedDate
                ? `Published: ${source.publishedDate}`
                : "Published: unknown";

            return [
                `Source ${index + 1}: ${source.title}`,
                `URL: ${source.url}`,
                publishedLine,
                `Snippet: ${source.snippet}`,
            ].join("\n");
        })
        .join("\n\n");
}

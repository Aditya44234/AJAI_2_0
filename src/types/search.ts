

export type SearchFreshness = "stable" | "recent" | "breaking"

export interface SearchDecision {
    needsSearch: boolean;
    searchQuery: string;
    reason: string;
    freshness: SearchFreshness;
}

export interface TavilyRawResult {
    title?: string;
    url?: string;
    content?: string;
    score?: number;
    published_date?: string;
}


export interface TavilySearchResponse {
    query?: string;
    results?: TavilyRawResult[];
}

export interface SearchSource {
    id: string;
    title: string;
    url: string;
    snippet: string;
    score?: number;
    publishedDate?: string;
}

export interface SearchResponse {
    query: string;
    sources: SearchSource[];
}


export interface GroundedAnswerResult {
    stream: AsyncIterable<string>;
    provider: string;
    sources: SearchSource[];
}
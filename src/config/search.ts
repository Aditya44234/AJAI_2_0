export const SEARCH_RESULT_LIMIT = 3;
export const SEARCH_CONTENT_MAX_CHARS = 1200;
export const SEARCH_SNIPPET_MAX_CHARS = 400;
export const SEARCH_TIMEOUT_MS = 10000;

export const SEARCH_DECISION_FALLBACK = {
    needsSearch: false,
    searchQuery: "",
    reason: "Classifier fallback",
    freshness: "stable" as const,
};

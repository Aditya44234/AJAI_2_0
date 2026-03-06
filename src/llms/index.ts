

// import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";

export const LLM_PROVIDERS = [
    GeminiProvider,
    GroqProvider,
];
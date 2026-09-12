import { LLMMessage, LLMProvider } from "@/src/types/llm";
import Groq from "groq-sdk";
// Groq, GoogleGenerativeAI
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export const GroqProvider: LLMProvider = {
    name: "groq",

    async streamMessage(messages: LLMMessage[]) {
        // ✅ UPDATED, SUPPORTED MODEL
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",  // ✅ Recommended replacement
            messages,
            stream: true,
        });
        return (async function* () {
            for await (const chunk of response) {
                const text = chunk.choices[0]?.delta?.content ?? "";
                if (text) {
                    yield text;
                }
            }
        })();
    },
};

import Groq from "groq-sdk";
import { LLMMessage, LLMProvider } from "@/src/types/llm";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export const GroqProvider: LLMProvider = {
    name: "groq",

    async streamMessage(messages: LLMMessage[]) {
        // ✅ UPDATED, SUPPORTED MODEL
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",  // Official replacement
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

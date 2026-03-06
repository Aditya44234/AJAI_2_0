import Groq from "groq-sdk";
import { LLMMessage, LLMProvider } from "@/src/types/llm";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export const GroqProvider: LLMProvider = {
    name: "groq",

    async sendMessage(messages: LLMMessage[]) {
        // ✅ UPDATED, SUPPORTED MODEL
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",  // Official replacement
            messages,
        });
        return response.choices[0].message.content || "";
    },
};

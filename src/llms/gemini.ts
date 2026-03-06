import { GoogleGenerativeAI } from "@google/generative-ai";

import { LLMMessage, LLMProvider } from "../types/llm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const GeminiProvider: LLMProvider = {
    name: "gemini",

    async sendMessage(messages: LLMMessage[]) {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",  // or "gemini-2.5-flash-latest" for auto-updates
        });

        const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

        const result = await model.generateContent(prompt);
        return result.response.text();
    },
};
import { GoogleGenerativeAI } from "@google/generative-ai";

import { LLMMessage, LLMProvider } from "../types/llm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const GeminiProvider: LLMProvider = {
    name: "gemini",

    async streamMessage(messages: LLMMessage[]) {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const systemInstruction = messages.find((message) => message.role === "system")?.content;
        const contents = messages
            .filter((message) => message.role !== "system")
            .map((message) => ({
                role: message.role === "assistant" ? "model" : "user",
                parts: [{ text: message.content }],
            }));

        const result = await model.generateContentStream({
            contents,
            ...(systemInstruction ? { systemInstruction } : {}),
        });

        return (async function* () {
            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    yield text;
                }
            }
        })();
    },
};



import OpenAI from "openai";
import { LLMMessage, LLMProvider } from "../types/llm";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export const OpenAIProvider: LLMProvider = {
    name: "openai",
    async streamMessage(messages: LLMMessage[]) {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
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
}

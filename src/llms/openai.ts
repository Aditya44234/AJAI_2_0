

import OpenAI from "openai";
import { LLMMessage, LLMProvider } from "../types/llm";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export const OpenAIProvider: LLMProvider = {
    name: "openai",
    async sendMessage(messages: LLMMessage[]) {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });
        return response.choices[0].message.content || "";
    },
}
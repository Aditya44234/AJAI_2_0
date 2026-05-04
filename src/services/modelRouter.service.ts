import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

import { LLM_PROVIDERS } from "../llms";
import { LLMMessage } from "../types/llm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

function stripCodeFences(text: string): string {
    const trimmed = text.trim();

    if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
        return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    return trimmed;
}

export async function generateAIResponseStream(
    messages: LLMMessage[],
): Promise<{ stream: AsyncIterable<string>; provider: string }> {
    let lastError: unknown = null;

    for (const provider of LLM_PROVIDERS) {
        try {
            const stream = await provider.streamMessage(messages);
            return {
                stream,
                provider: provider.name,
            };
        } catch (error) {
            lastError = error;
        }
    }

    if (lastError instanceof Error) {
        throw lastError;
    }

    throw new Error("All AI providers failed");
}

async function generateGeminiText(messages: LLMMessage[]): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const systemInstruction = messages.find(
        (message) => message.role === "system",
    )?.content;

    const contents = messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
        }));

    const result = await model.generateContent({
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
    });

    const text = result.response.text();

    if (!text) {
        throw new Error("Gemini returned an empty text response");
    }

    return stripCodeFences(text);
}

async function generateGroqText(messages: LLMMessage[]): Promise<string> {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages,
        stream: false,
    });

    const text = response.choices[0]?.message?.content;

    if (!text || typeof text !== "string") {
        throw new Error("Groq returned an empty text response");
    }

    return stripCodeFences(text);
}

export async function generateModelText(prompt: string): Promise<string> {
    const messages: LLMMessage[] = [
        {
            role: "user",
            content: prompt,
        },
    ];

    const attempts: Array<{
        name: string;
        run: () => Promise<string>;
    }> = [
            {
                name: "gemini",
                run: () => generateGeminiText(messages),
            },
            {
                name: "groq",
                run: () => generateGroqText(messages),
            },
        ];

    let lastError: unknown = null;

    for (const attempt of attempts) {
        try {
            return await attempt.run();
        } catch (error) {
            lastError = error;
        }
    }

    if (lastError instanceof Error) {
        throw lastError;
    }

    throw new Error("All text-generation providers failed");
}

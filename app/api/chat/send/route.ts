import { NextResponse } from "next/server";

import { getAuthUser } from "@/src/middleware/auth.middleware";
import { corsHeaders, handleCors } from "@/src/middleware/cors";

import { createChat, addMessage, getChatHistory } from "@/src/services/chat.service";
import { checkAndIncrementUsage } from "@/src/services/usage.service";
import { getTempUserId } from "@/src/utils/tempUser";

import { generateAIResponseStream } from "@/src/services/modelRouter.service";
import { classifyQueryForSearch } from "@/src/services/queryClassifier.service";
import { searchWeb } from "@/src/services/webSearch.service";
import {
    formatSearchSources,
} from "@/src/services/sourceFormatter.service";
import { generateGroundedAnswerStream } from "@/src/services/groundedAnswer.service";

import type { LLMMessage } from "@/src/types/llm";
import type { SearchSource } from "@/src/types/search";

import {
    PERSONALITY_PROMPTS,
    PersonalityType,
} from "@/src/constants/personalities";

function streamHeaders() {
    return {
        ...corsHeaders(),
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "application/x-ndjson; charset=utf-8",
    };
}

export async function OPTIONS() {
    return handleCors();
}

function buildBaseMessages(
    history: Array<{ role: "user" | "assistant"; content: string }>,
    personality: PersonalityType,
): LLMMessage[] {
    return [
        {
            role: "system",
            content: PERSONALITY_PROMPTS[personality],
        },
        ...history.map((message) => ({
            role: message.role,
            content: message.content,
        })),
    ];
}

async function resolveUserIdentity() {
    try {
        const user = await getAuthUser();
        return {
            userId: user.id,
            isTemp: false,
        };
    } catch {
        return {
            userId: await getTempUserId(),
            isTemp: true,
        };
    }
}

async function buildAssistantResponse(
    messages: LLMMessage[],
): Promise<{
    stream: AsyncIterable<string>;
    provider: string;
    sources: SearchSource[];
    usedSearch: boolean;
    searchQuery?: string;
}> {
    const decision = await classifyQueryForSearch(messages);

    if (!decision.needsSearch) {
        const direct = await generateAIResponseStream(messages);
        return {
            stream: direct.stream,
            provider: direct.provider,
            sources: [],
            usedSearch: false,
        };
    }

    const rawResults = await searchWeb(decision.searchQuery);
    const sources = formatSearchSources(rawResults);

    if (sources.length === 0) {
        throw new Error("Search was required, but no usable web sources were found.");
    }

    const grounded = await generateGroundedAnswerStream(messages, sources);

    return {
        stream: grounded.stream,
        provider: grounded.provider,
        sources: grounded.sources,
        usedSearch: true,
        searchQuery: decision.searchQuery,
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const message: string | undefined = body.message;
        const chatId: string | undefined = body.chatId;
        const personality = body.personality as PersonalityType | undefined;

        const selectedPersonality: PersonalityType =
            personality && PERSONALITY_PROMPTS[personality]
                ? personality
                : "default";

        if (!message?.trim()) {
            return NextResponse.json(
                { message: "Message is required" },
                { status: 400 },
            );
        }

        const { userId, isTemp } = await resolveUserIdentity();

        await checkAndIncrementUsage(userId, isTemp);

        const chat = chatId
            ? { _id: chatId }
            : await createChat(userId, isTemp);

        await addMessage(chat._id.toString(), "user", message);

        const history = await getChatHistory(chat._id.toString());

        const messages = buildBaseMessages(history, selectedPersonality);

        const encoder = new TextEncoder();

        return new Response(
            new ReadableStream({
                async start(controller) {
                    const push = (payload: Record<string, unknown>) => {
                        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
                    };

                    let reply = "";

                    try {
                        push({
                            type: "meta",
                            chatId: chat._id.toString(),
                            personality: selectedPersonality,
                        });

                        const result = await buildAssistantResponse(messages);

                        if (result.usedSearch && result.searchQuery) {
                            push({
                                type: "search-start",
                                query: result.searchQuery,
                            });

                            push({
                                type: "search-results",
                                sources: result.sources,
                            });
                        }

                        push({
                            type: "meta",
                            chatId: chat._id.toString(),
                            provider: result.provider,
                            personality: selectedPersonality,
                        });

                        for await (const delta of result.stream) {
                            if (!delta) {
                                continue;
                            }

                            reply += delta;
                            push({
                                type: "delta",
                                text: delta,
                            });
                        }

                        if (reply) {
                            await addMessage(chat._id.toString(), "assistant", reply);
                        }

                        push({
                            type: "done",
                            chatId: chat._id.toString(),
                            provider: result.provider,
                            sources: result.sources,
                        });
                    } catch (error) {
                        if (reply) {
                            try {
                                await addMessage(chat._id.toString(), "assistant", reply);
                            } catch {
                                // Ignore assistant persistence failure for partial output.
                            }
                        }

                        push({
                            type: "error",
                            message:
                                error instanceof Error
                                    ? error.message
                                    : "Something went wrong",
                        });
                    } finally {
                        controller.close();
                    }
                },
            }),
            {
                headers: streamHeaders(),
            },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Something went wrong",
            },
            { status: 400 },
        );
    }
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/middleware/auth.middleware";

import {
    createChat,
    addMessage,
    getChatHistory,
} from "@/src/services/chat.service";

import { checkAndIncrementUsage } from "@/src/services/usage.service";
import { getTempUserId } from "@/src/utils/tempUser";
import { generateAIResponseStream } from "@/src/services/modelRouter.service";

import { LLMMessage } from "@/src/types/llm";
import {
    PERSONALITY_PROMPTS,
    PersonalityType,
} from "@/src/constants/personalities";

import { corsHeaders, handleCors } from "@/src/middleware/cors";

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

        if (!message) {
            return NextResponse.json(
                { message: "Message is required" },
                { status: 400 }
            );
        }

        let userId: string;
        let isTemp = false;

        try {
            const user = await getAuthUser();
            userId = user.id;
        } catch {
            isTemp = true;
            userId = await getTempUserId();
        }

        await checkAndIncrementUsage(userId, isTemp);

        const chat = chatId
            ? { _id: chatId }
            : await createChat(userId, isTemp);

        await addMessage(chat._id.toString(), "user", message);

        const history = await getChatHistory(chat._id.toString());

        const messages: LLMMessage[] = [
            {
                role: "system",
                content: PERSONALITY_PROMPTS[selectedPersonality],
            },
            ...history.map((historyMessage) => ({
                role: historyMessage.role,
                content: historyMessage.content,
            })),
        ];

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

                        const { stream, provider } = await generateAIResponseStream(messages);

                        push({
                            type: "meta",
                            chatId: chat._id.toString(),
                            provider,
                            personality: selectedPersonality,
                        });

                        for await (const delta of stream) {
                            if (!delta) {
                                continue;
                            }

                            reply += delta;
                            push({ type: "delta", text: delta });
                        }

                        if (reply) {
                            await addMessage(chat._id.toString(), "assistant", reply);
                        }

                        push({
                            type: "done",
                            chatId: chat._id.toString(),
                            provider,
                        });
                    } catch (error) {
                        if (reply) {
                            try {
                                await addMessage(chat._id.toString(), "assistant", reply);
                            } catch {
                                // Ignore persistence failures for partial replies.
                            }
                        }

                        push({
                            type: "error",
                            message: error instanceof Error ? error.message : "Something went wrong",
                        });
                    } finally {
                        controller.close();
                    }
                },
            }),
            {
                headers: streamHeaders(),
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 400 }
        );
    }
}

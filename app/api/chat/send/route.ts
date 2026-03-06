import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/middleware/auth.middleware";

import {
    createChat,
    addMessage,
    getChatHistory,
} from "@/src/services/chat.service";

import { checkAndIncrementUsage } from "@/src/services/usage.service";
import { getTempUserId } from "@/src/utils/tempUser";
import { generateAIResponses } from "@/src/services/modelRouter.service";

import { LLMMessage } from "@/src/types/llm";
import {
    PERSONALITY_PROMPTS,
    PersonalityType,
} from "@/src/constants/personalities";

import { corsHeaders, handleCors } from "@/src/middleware/cors";


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

        // 🔥 IDENTIFY USER (LOGGED-IN OR TEMP)
        let userId: string;
        let isTemp = false;

        try {
            const user = await getAuthUser();
            userId = user.id;
        } catch {
            isTemp = true;
            userId = await getTempUserId();
        }

        // 🔥 RATE LIMIT CHECK (BEFORE AI + DB)
        await checkAndIncrementUsage(userId, isTemp);

        // 1️⃣ Create or reuse chat
        const chat = chatId
            ? { _id: chatId }
            : await createChat(userId, isTemp);

        // 2️⃣ Save user message
        await addMessage(chat._id.toString(), "user", message);

        // 3️⃣ Fetch history
        const history = await getChatHistory(chat._id.toString());

        // 4️⃣ Build LLM message array
        const messages: LLMMessage[] = [
            {
                role: "system",
                content: PERSONALITY_PROMPTS[selectedPersonality],
            },
            ...history.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        ];

        // 5️⃣ AI call
        const { reply, provider } = await generateAIResponses(messages);

        // 6️⃣ Save AI response
        await addMessage(chat._id.toString(), "assistant", reply);

        // 7️⃣ Return
        return NextResponse.json({
            chatId: chat._id,
            reply,
            provider,
            personality: selectedPersonality,
            headers: corsHeaders()
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 400 }
        );
    }
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/middleware/auth.middleware";
import { getTempUserId } from "@/src/utils/tempUser";
import { connectDB } from "@/src/config/db";
import { Chat } from "@/src/models/Chat";
import { Message } from "@/src/models/Message";
import { corsHeaders, handleCors } from "@/src/middleware/cors";

export async function OPTIONS() {
    return handleCors();
}

export async function GET(
    req: Request,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();

        // Await params 
        const { chatId } = await context.params;

        if (!chatId) {
            return NextResponse.json(
                { message: "Chat ID is required" },
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


        const chat = await Chat.findById(chatId);

        if (!chat) {
            return NextResponse.json(
                { message: "Chat not found" },
                { status: 404 }
            );
        }

        if (
            (isTemp && chat.tempId !== userId) ||
            (!isTemp && chat.userId?.toString() !== userId)
        ) {
            return NextResponse.json(
                { message: "Unauthorized access to chat" },
                { status: 403 }
            );
        }

        // Fetch messages
        const messages = await Message.find({ chatId })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            chatId,
            title: chat.title,
            messages,
            headers: corsHeaders()
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Failed to fetch messages" },
            { status: 400 },

        );
    }
}

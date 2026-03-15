import { connectDB } from "@/src/config/db";
import { getAuthUser } from "@/src/middleware/auth.middleware";
import { corsHeaders, handleCors } from "@/src/middleware/cors";
import { Chat } from "@/src/models/Chat";
import { Message } from "@/src/models/Message";
import { getTempUserId } from "@/src/utils/tempUser";
import { NextResponse } from "next/server";

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


async function verifyChatOwner(chatId: string) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return { status: 404, body: { message: "Chat not found" } };
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

    const isOwner =
        (isTemp && chat.tempId === userId) ||
        (!isTemp && chat.userId?.toString() === userId);

    if (!isOwner) {
        return { status: 403, body: { message: "Unauthorized access to chat" } };
    }

    return { status: 200, chat };
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();
        const { chatId } = await context.params;
        if (!chatId) {
            return NextResponse.json({ message: "Chat ID is required" }, { status: 400 });
        }

        const verification = await verifyChatOwner(chatId);
        if (verification.status !== 200) {
            return NextResponse.json(verification.body, { status: verification.status });
        }

        const body = await req.json();
        const pinned = Boolean(body.pinned);
        await Chat.findByIdAndUpdate(chatId, { pinned });
        return NextResponse.json({ success: true, pinned });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to pin chat" }, { status: 400 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();
        const { chatId } = await context.params;
        if (!chatId) {
            return NextResponse.json({ message: "Chat ID is required" }, { status: 400 });
        }

        const verification = await verifyChatOwner(chatId);
        if (verification.status !== 200) {
            return NextResponse.json(verification.body, { status: verification.status });
        }

        await Chat.findByIdAndDelete(chatId);
        await Message.deleteMany({ chatId });

        return NextResponse.json({ success: true, message: "Chat deleted" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to delete chat" }, { status: 400 });
    }
}
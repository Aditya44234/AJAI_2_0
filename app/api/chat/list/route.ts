import { connectDB } from "@/src/config/db";
import { getAuthUser } from "@/src/middleware/auth.middleware";
import { Chat } from "@/src/models/Chat";
import { Message } from "@/src/models/Message";
import { getTempUserId } from "@/src/utils/tempUser";
import { NextResponse } from "next/server";

import { corsHeaders, handleCors } from "@/src/middleware/cors";


export async function OPTIONS() {
    return handleCors();
}


 
export async function GET() {
    try {
        await connectDB();

        let userId: string;
        let isTemp = false;


        try {

            const user = await getAuthUser();
            userId = user.id;
        } catch (error) {
            isTemp = true;
            userId = await getTempUserId();
        }


        const chats = await Chat.find(
            isTemp ? { tempId: userId } : { userId }
        )
            .sort({ lastMessageAt: -1 })
            .lean()


        const chatList = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await Message.findOne({ chatId: chat._id })
                    .sort({ createdAt: -1 })
                    .lean();

                return {
                    chatId: chat._id,
                    title: chat.title,
                    createdAt: chat.createdAt,
                    lastMessage: lastMessage?.content || "",
                    headers: corsHeaders()
                };
            })
        );

        return NextResponse.json(chatList);

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Failed to fetch chats" },
            { status: 400 }

        );

    }
}
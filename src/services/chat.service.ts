import { connectDB } from "../config/db";
import { Chat } from "@/src/models/Chat"
import { Message } from "../models/Message";
import { generateChatTitle } from "../utils/generateTitle";


// export async function createChat(userId?: string) {
//     await connectDB();
//     const chat = await Chat.create({
//         userId: userId || undefined,
//     });
//     return chat;
// }


export async function createChat(
  id: string,
  isTemp: boolean
) {
  await connectDB();

  const chatData = isTemp
    ? { tempId: id }
    : { userId: id };

  const chat = await Chat.create(chatData);

  return chat;
}

export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
) {
  await connectDB();

  const message = await Message.create({
    chatId,
    role,
    content,
  });

  const chat = await Chat.findById(chatId);

  if (chat) {
    //  Update last activity
    chat.lastMessageAt = new Date();

    //  Auto-title logic
    if (role === "user" && chat.title === "New Chat") {
      chat.title = generateChatTitle(content);
    }

    await chat.save();
  }

  return message;
}


export async function getChatHistory(chatId: string) {
  await connectDB();
  return Message.find({ chatId }).sort({ createdAt: 1 });
}
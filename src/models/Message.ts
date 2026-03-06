import { Schema, model, models, Types } from "mongoose"

export interface IMessage {
    chatId: Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

    },

    { timestamps: true }
);

export const Message = models.Message || model<IMessage>("Message", MessageSchema) 
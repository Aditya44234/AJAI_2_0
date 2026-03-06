

import { Schema, models, model, Types } from "mongoose"


export interface IChat {
    userId?: Types.ObjectId;
    tempId?: string;
    title: string;
    createdAt: Date;
    lastMessageAt: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },
        tempId: {
            type: String,
            required: false,
            index: true,
        },
        title: {
            type: String,
            default: "New Chat",
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true }
);

export const Chat = models.Chat || model<IChat>("Chat", ChatSchema)
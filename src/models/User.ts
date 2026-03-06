
import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({

    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
},
    { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
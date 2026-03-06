import { StringQueryTypeCasting } from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User"
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";


export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already Exists")
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = signToken({
        id: user._id,
        email: user.email,
        name: user.name,
    });

    return { user, token }
}


export async function loginUser(email: string, password: string) {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        throw new Error("INvalid credentials");
    }

    const token = signToken({
        id: user._id,
        email: user.email,
        name: user.name,
    });

    return { user, token }
}
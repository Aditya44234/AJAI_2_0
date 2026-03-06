import { NextResponse } from "next/server";
import { registerUser } from "@/src/services/auth.service";

import { corsHeaders, handleCors } from "@/src/middleware/cors";

export async function OPTIONS() {
    return handleCors();
}

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "ALl fields are required" },
                { status: 400 }
            );
        }

        const { user, token } = await registerUser(name, email, password);

        const response = NextResponse.json({
            message: "Registration Done",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
             headers: corsHeaders() 


        })

    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    })
    return response
} catch (error: any) {
    return NextResponse.json(
        { message: error.message || "Registration failed" },
        { status: 500 }
    );
}
}
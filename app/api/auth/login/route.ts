import { NextResponse } from "next/server";
import { loginUser } from "@/src/services/auth.service";
import { corsHeaders, handleCors } from "@/src/middleware/cors";
// import { corsHeaders, handleCors } from "@/src/middleware/cors";


export async function OPTIONS() {
    return handleCors();
}

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const { user, token } = await loginUser(email, password);

        const response = NextResponse.json({
            message: "Login Done",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            headers: corsHeaders()
        });


        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        return response;

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Login failed" },
            { status: 401 }
        );
    }
}
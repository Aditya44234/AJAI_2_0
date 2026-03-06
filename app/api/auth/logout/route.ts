import { NextResponse } from "next/server"
import { corsHeaders, handleCors } from "@/src/middleware/cors";


export async function OPTIONS() {
    return handleCors();
}

export async function POST() {
    const response = NextResponse.json({
        message: "Logged out successfully",
        headers: corsHeaders()
    });

    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    })

    return response;
}
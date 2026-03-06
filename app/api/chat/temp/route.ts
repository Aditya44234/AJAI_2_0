import { NextResponse } from "next/server";


import { corsHeaders, handleCors } from "@/src/middleware/cors";


export async function OPTIONS() {
    return handleCors();
}

export async function POST(req: Request) {
    const { message } = await req.json();


    if (!message) {
        return NextResponse.json(
            { message: "Message is required" },
            { status: 400 }
        );
    }


    const aiReply = "Temporary AI response"

    return NextResponse.json({
        reply: aiReply,
        headers: corsHeaders()
    })
}
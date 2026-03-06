import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/middleware/auth.middleware";
import { corsHeaders, handleCors } from "@/src/middleware/cors";


export async function OPTIONS() {
  return handleCors();
}


export async function GET() {
    try {
        const user = getAuthUser();
        return NextResponse.json({ user,
             headers: corsHeaders()
         });
    } catch (error) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        )
    }
}
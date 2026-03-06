import { cookies } from "next/headers";
import { verifyToken } from "@/src/utils/jwt";

export interface AuthPayload {
    id: string;
    email: string;
    name: string;
}

export async function getAuthUser(): Promise<AuthPayload> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    return verifyToken<AuthPayload>(token);
}

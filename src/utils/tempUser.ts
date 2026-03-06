import { cookies } from "next/headers";
import crypto from "crypto";

export async function getTempUserId(): Promise<string> {
  const cookieStore = await cookies();

  let tempId = cookieStore.get("temp_id")?.value;

  if (!tempId) {
    tempId = crypto.randomUUID();

    cookieStore.set("temp_id", tempId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return tempId;
}

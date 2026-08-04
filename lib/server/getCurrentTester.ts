import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants/codes";
import { verifySessionToken } from "@/lib/server/session";

export async function getCurrentTesterId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

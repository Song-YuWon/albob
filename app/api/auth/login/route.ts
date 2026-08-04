import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { findTester } from "@/lib/server/testers";
import { createSessionToken } from "@/lib/server/session";
import { MESSAGES } from "@/lib/constants/messages";
import {
  API_ERROR_CODE,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/constants/codes";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: API_ERROR_CODE.VALIDATION_ERROR,
        message: parsed.error.issues[0]?.message ?? MESSAGES.auth.loginFailed,
      },
      { status: 400 },
    );
  }

  const tester = findTester(parsed.data.id, parsed.data.password);
  if (!tester) {
    return NextResponse.json(
      { code: API_ERROR_CODE.INVALID_CREDENTIALS, message: MESSAGES.auth.loginFailed },
      { status: 401 },
    );
  }

  const token = await createSessionToken(tester.id);
  const response = NextResponse.json({ id: tester.id });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}

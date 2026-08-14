import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";
import { verifySessionToken } from "@/lib/server/session";

// 공개 경로 — 세션 쿠키 없이도 접근 가능
// /api/health: UptimeRobot 등 외부 모니터링이 로그인 없이 호출(Supabase 무료 티어
// 자동 일시정지 방지용 핑) — 실제 사용자 데이터는 노출하지 않는 단순 DB 연결 확인용
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/health"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const testerId = token ? await verifySessionToken(token) : null;

  if (testerId) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

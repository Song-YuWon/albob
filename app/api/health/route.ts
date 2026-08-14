import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db/health";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

// UptimeRobot 등 외부 모니터링이 로그인 없이 주기적으로 호출하는 엔드포인트(proxy.ts의
// PUBLIC_PATHS에 등록돼 있음). 단순 200 응답만 주면 Supabase는 안 건드리므로 무료 티어
// 자동 일시정지를 못 막는다 — 실제 DB 조회를 포함해야 "활동"으로 잡힌다.
export async function GET() {
  const supabase = createSupabaseAdminClient();
  const ok = await pingDatabase(supabase);
  return NextResponse.json({ ok }, { status: ok ? 200 : 503 });
}

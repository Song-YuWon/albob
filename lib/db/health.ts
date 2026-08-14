import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase 무료 티어는 일정 기간(대략 1주일) API 활동이 없으면 프로젝트를 자동
// 일시정지한다 — 이 조회 자체가 그 "활동"으로 잡히게 하려는 최소 헬스체크 쿼리.
export async function pingDatabase(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from("products").select("id").limit(1);
  return !error;
}

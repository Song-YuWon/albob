import type { SupabaseClient } from "@supabase/supabase-js";
import { INGREDIENT_STATUS } from "@/lib/constants/codes";

// service role 클라이언트를 인자로 받는다 — Next.js 앱(lib/server, server-only 가드 적용)과
// 순수 Node로 실행되는 시드 스크립트(scripts/) 양쪽에서 이 쿼리 로직을 그대로 재사용하기 위함
export async function listIngredientNames(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("ingredients").select("name");
  if (error) throw error;
  return (data ?? []).map((row) => row.name as string);
}

export async function insertApprovedIngredients(
  supabase: SupabaseClient,
  names: string[],
): Promise<number> {
  if (names.length === 0) return 0;

  const { error } = await supabase
    .from("ingredients")
    .insert(names.map((name) => ({ name, status: INGREDIENT_STATUS.APPROVED })));

  if (error) throw error;
  return names.length;
}

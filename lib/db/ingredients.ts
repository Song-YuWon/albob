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

export interface MatchedIngredient {
  id: string;
  name: string;
}

// OCR로 뽑은 후보 이름을 성분 마스터와 정확히(대소문자만 무시) 일치하는 것만 매칭한다.
// 애매한 후보를 자동으로 비슷한 성분에 잘못 연결하지 않기 위해 일부러 유사도 매칭을 쓰지 않음 —
// 유사도 기반 추천은 사용자가 태그를 직접 탭해서 여는 검색 화면(9.6)에서만 일어난다.
export async function matchIngredientsByExactName(
  supabase: SupabaseClient,
  candidateNames: string[],
): Promise<Map<string, MatchedIngredient>> {
  if (candidateNames.length === 0) return new Map();

  const { data, error } = await supabase.from("ingredients").select("id, name").in("name", candidateNames);
  if (error) throw error;

  const map = new Map<string, MatchedIngredient>();
  for (const row of data ?? []) {
    map.set((row.name as string).toLowerCase(), { id: row.id as string, name: row.name as string });
  }
  return map;
}

export interface IngredientSearchResult {
  id: string;
  name: string;
  status: "approved" | "pending";
}

// 태그 칩을 탭했을 때 여는 검색 화면(9.6)에서 사용 — 부분 일치/유사도 기반, pending도 후보에 포함
export async function searchIngredients(
  supabase: SupabaseClient,
  keyword: string,
  matchLimit = 10,
): Promise<IngredientSearchResult[]> {
  const { data, error } = await supabase.rpc("search_ingredients", {
    keyword,
    match_limit: matchLimit,
  });

  if (error) throw error;

  return (data ?? []).map((row: { id: string; name: string; status: string }) => ({
    id: row.id,
    name: row.name,
    status: row.status as "approved" | "pending",
  }));
}

// "추가 요청하기" — 즉시 pending 성분을 만들어 바로 사용 가능하게 한다 (기획서 v1.6 3.1).
// 동시에 같은 이름을 요청해서 유니크 인덱스 충돌이 나면, 새로 만들지 않고 기존 걸 그대로 반환한다.
export async function requestIngredient(
  supabase: SupabaseClient,
  params: { name: string; requestedBy: string },
): Promise<MatchedIngredient> {
  const { data, error } = await supabase
    .from("ingredients")
    .insert({ name: params.name, status: INGREDIENT_STATUS.PENDING, requested_by: params.requestedBy })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing, error: fetchError } = await supabase
        .from("ingredients")
        .select("id, name")
        .ilike("name", params.name)
        .single();
      if (fetchError) throw fetchError;
      return { id: existing.id as string, name: existing.name as string };
    }
    throw error;
  }

  return { id: data.id as string, name: data.name as string };
}

import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  frontPhotoUrl: string | null;
  ingredientCount: number;
}

// "정확히 일치" — 이름/브랜드에 검색어가 포함된 제품 (9.3의 2번 분기)
export async function searchProductsByKeyword(
  supabase: SupabaseClient,
  keyword: string,
): Promise<ProductSummary[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, front_photo_url, product_ingredients(count)")
    .or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string,
    frontPhotoUrl: row.front_photo_url as string | null,
    ingredientCount:
      (row.product_ingredients as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

// 정확히 일치하는 결과가 없을 때의 유사 후보 (9.3의 3번 분기) — pg_trgm 유사도 기반, DB 함수로 위임
export async function findSimilarProducts(
  supabase: SupabaseClient,
  keyword: string,
  matchLimit = 3,
): Promise<ProductSummary[]> {
  const { data, error } = await supabase.rpc("search_similar_products", {
    keyword,
    match_limit: matchLimit,
  });

  if (error) throw error;

  return (data ?? []).map(
    (row: {
      id: string;
      name: string;
      brand: string;
      front_photo_url: string | null;
      ingredient_count: number;
    }) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      frontPhotoUrl: row.front_photo_url,
      ingredientCount: row.ingredient_count ?? 0,
    }),
  );
}

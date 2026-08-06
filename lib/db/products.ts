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

export interface CreateProductParams {
  name: string;
  brand: string;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  ingredientIds: string[];
  createdBy: string;
}

// 최초 등록 — created_by/updated_by를 둘 다 등록자로 채운다. 이후 다른 테스터가 고치면
// updated_by만 바뀌고 created_by는 최초 등록자로 그대로 남는다 (3.5).
export async function createProduct(
  supabase: SupabaseClient,
  params: CreateProductParams,
): Promise<string> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: params.name,
      brand: params.brand,
      front_photo_url: params.frontPhotoUrl,
      back_photo_url: params.backPhotoUrl,
      created_by: params.createdBy,
      updated_by: params.createdBy,
    })
    .select("id")
    .single();

  if (error) throw error;
  const productId = data.id as string;

  if (params.ingredientIds.length > 0) {
    const { error: linkError } = await supabase
      .from("product_ingredients")
      .insert(params.ingredientIds.map((ingredientId) => ({ product_id: productId, ingredient_id: ingredientId })));
    if (linkError) throw linkError;
  }

  return productId;
}

export interface UpdateProductParams {
  name: string;
  brand: string;
  ingredientIds: string[];
  updatedBy: string;
}

// 공유 데이터 원칙(기획서 3.3) — 등록자 여부와 관계없이 로그인한 테스터면 누구나 수정 가능.
// updated_by/updated_at을 갱신하고 product_edit_logs에 이력을 남긴다. "수정 횟수"는 이 로그의
// 건수를 그대로 쓰므로 별도 카운터를 갱신할 필요가 없다.
export async function updateProduct(
  supabase: SupabaseClient,
  productId: string,
  params: UpdateProductParams,
): Promise<void> {
  const { error: updateError } = await supabase
    .from("products")
    .update({
      name: params.name,
      brand: params.brand,
      updated_by: params.updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
  if (updateError) throw updateError;

  const { error: deleteError } = await supabase.from("product_ingredients").delete().eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (params.ingredientIds.length > 0) {
    const { error: insertError } = await supabase
      .from("product_ingredients")
      .insert(params.ingredientIds.map((ingredientId) => ({ product_id: productId, ingredient_id: ingredientId })));
    if (insertError) throw insertError;
  }

  const { error: logError } = await supabase
    .from("product_edit_logs")
    .insert({ product_id: productId, editor: params.updatedBy, summary: `${params.name} · ${params.brand} 수정` });
  if (logError) throw logError;
}

export interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  frontPhotoUrl: string | null;
  backPhotoUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  viewCount: number;
  editCount: number;
  reviewCount: number;
  ingredients: { id: string; name: string; status: "approved" | "pending" }[];
}

interface ProductDetailRow {
  id: string;
  name: string;
  brand: string;
  front_photo_url: string | null;
  back_photo_url: string | null;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  view_count: number;
  product_edit_logs: { count: number }[] | null;
  reviews: { count: number }[] | null;
  product_ingredients: { ingredients: { id: string; name: string; status: string } | null }[] | null;
}

// 신뢰 메타데이터(등록자·최종 수정자·조회수·수정 횟수) + 성분 목록을 한 번에 조회 (기획서 v1.6 3.2).
// 수정 횟수는 별도 카운터가 아니라 product_edit_logs 건수를 그대로 쓴다 — 값이 어긋나지 않게.
export async function getProductDetail(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, brand, front_photo_url, back_photo_url, created_by, created_at, updated_by, updated_at, view_count, product_edit_logs(count), reviews(count), product_ingredients(ingredients(id, name, status))",
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ProductDetailRow;

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    frontPhotoUrl: row.front_photo_url,
    backPhotoUrl: row.back_photo_url,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    viewCount: row.view_count,
    editCount: row.product_edit_logs?.[0]?.count ?? 0,
    reviewCount: row.reviews?.[0]?.count ?? 0,
    ingredients: (row.product_ingredients ?? [])
      .map((link) => link.ingredients)
      .filter((ingredient): ingredient is { id: string; name: string; status: string } => Boolean(ingredient))
      .map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        status: ingredient.status as "approved" | "pending",
      })),
  };
}

export async function incrementProductViewCount(supabase: SupabaseClient, productId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_product_view_count", { target_id: productId });
  if (error) throw error;
}

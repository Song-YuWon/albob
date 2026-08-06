import type { SupabaseClient } from "@supabase/supabase-js";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

const REVIEW_COLUMNS = "id, product_id, user_id, rating, comment, created_at, updated_at";

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 제품 상세의 리뷰 요약(평균 별점 + 개수) — 별도 카운터 없이 매번 집계한다
export async function getReviewSummary(supabase: SupabaseClient, productId: string): Promise<ReviewSummary> {
  const { data, error } = await supabase.from("reviews").select("rating").eq("product_id", productId);
  if (error) throw error;

  const ratings = (data ?? []).map((row) => row.rating as number);
  const count = ratings.length;
  const averageRating = count === 0 ? 0 : ratings.reduce((sum, rating) => sum + rating, 0) / count;

  return { averageRating, count };
}

// 최신순 리뷰 목록 — limit 없으면 전체(더보기 화면), 있으면 미리보기(제품 상세) 용도
export async function listReviews(supabase: SupabaseClient, productId: string, limit?: number): Promise<Review[]> {
  let query = supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => toReview(row as ReviewRow));
}

// 로그인한 테스터가 이 제품에 이미 남긴 리뷰(있다면) — 작성/수정 화면이 수정 모드로 열릴지 판단하는 데 쓴다
export async function getMyReview(
  supabase: SupabaseClient,
  productId: string,
  userId: string,
): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toReview(data as ReviewRow) : null;
}

export async function getReviewById(supabase: SupabaseClient, reviewId: string): Promise<Review | null> {
  const { data, error } = await supabase.from("reviews").select(REVIEW_COLUMNS).eq("id", reviewId).maybeSingle();
  if (error) throw error;
  return data ? toReview(data as ReviewRow) : null;
}

export interface CreateReviewParams {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}

// 한 사람당 제품 하나에 리뷰 하나만 남길 수 있다("내 리뷰" 단수 개념) — DB에도
// (product_id, user_id) unique 제약을 걸어뒀으니 동시 요청이 겹쳐도 중복 저장되지 않는다.
export async function createReview(supabase: SupabaseClient, params: CreateReviewParams): Promise<string> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: params.productId,
      user_id: params.userId,
      rating: params.rating,
      comment: params.comment,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export interface UpdateReviewParams {
  rating: number;
  comment: string;
}

// 작성자 본인인지 확인은 호출하는 라우트 쪽 책임 — 이 함수는 id로 무조건 갱신한다
export async function updateReview(
  supabase: SupabaseClient,
  reviewId: string,
  params: UpdateReviewParams,
): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ rating: params.rating, comment: params.comment, updated_at: new Date().toISOString() })
    .eq("id", reviewId);
  if (error) throw error;
}

export async function deleteReview(supabase: SupabaseClient, reviewId: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;
}

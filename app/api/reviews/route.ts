import { NextResponse } from "next/server";
import { createReviewSchema } from "@/lib/validation/review";
import { createReview, getMyReview } from "@/lib/db/reviews";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

export async function POST(request: Request) {
  const testerId = await getCurrentTesterId();
  if (!testerId) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: API_ERROR_CODE.VALIDATION_ERROR,
        message: parsed.error.issues[0]?.message ?? MESSAGES.upload.invalidRequest,
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  // 한 사람당 제품 하나에 리뷰 하나만 — 이미 있으면 새로 만들지 않고 명확히 안내한다
  const existing = await getMyReview(supabase, parsed.data.productId, testerId);
  if (existing) {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.review.alreadyReviewed },
      { status: 409 },
    );
  }

  const reviewId = await createReview(supabase, { ...parsed.data, userId: testerId });
  return NextResponse.json({ reviewId });
}

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { updateReviewSchema } from "@/lib/validation/review";
import { getReviewById, updateReview, deleteReview } from "@/lib/db/reviews";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 리뷰는 개인 콘텐츠라 작성자 본인만 수정/삭제 가능(제품 정보와 반대 원칙) — PATCH/DELETE 공통 가드
async function requireOwnReview(supabase: SupabaseClient, reviewId: string, testerId: string) {
  const review = await getReviewById(supabase, reviewId);
  if (!review) {
    return {
      error: NextResponse.json(
        { code: API_ERROR_CODE.NOT_FOUND, message: MESSAGES.review.notFound },
        { status: 404 },
      ),
    };
  }
  if (review.userId !== testerId) {
    return {
      error: NextResponse.json(
        { code: API_ERROR_CODE.FORBIDDEN, message: MESSAGES.review.forbidden },
        { status: 403 },
      ),
    };
  }
  return { error: null };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const testerId = await getCurrentTesterId();
  if (!testerId) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateReviewSchema.safeParse(body);

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
  const { error } = await requireOwnReview(supabase, id, testerId);
  if (error) return error;

  await updateReview(supabase, id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const testerId = await getCurrentTesterId();
  if (!testerId) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await requireOwnReview(supabase, id, testerId);
  if (error) return error;

  await deleteReview(supabase, id);
  return NextResponse.json({ ok: true });
}

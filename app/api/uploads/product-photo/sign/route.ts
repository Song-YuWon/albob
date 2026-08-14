import { NextResponse } from "next/server";
import { productPhotoUploadSchema } from "@/lib/validation/upload";
import { createSignedDraftPhotoUploadUrl } from "@/lib/db/productPhotos";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

// 브라우저가 이 파일 바이트 없이(작은 JSON만) 서명된 업로드 URL을 발급받는다 — 실제 사진은
// 이 Route Handler를 거치지 않고 브라우저에서 Supabase Storage로 직접 올라간다.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = productPhotoUploadSchema.safeParse(body);

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
  const signed = await createSignedDraftPhotoUploadUrl(supabase, parsed.data);

  return NextResponse.json(signed);
}

import { NextResponse } from "next/server";
import { productPhotoUploadSchema } from "@/lib/validation/upload";
import {
  downloadDraftProductPhotoOriginal,
  uploadDraftProductPhoto,
  deleteDraftProductPhotoOriginal,
} from "@/lib/db/productPhotos";
import { compressProductPhoto } from "@/lib/server/compressPhoto";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

// 브라우저가 원본을 Storage에 직접 올린 뒤 호출한다 — 서버가 그 원본을 내려받아(Route Handler
// 요청 본문 크기 제한과 무관, 서버 자신의 아웃바운드 호출) 압축하고 최종 자리에 다시 올린다.
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

  let original: Blob;
  try {
    original = await downloadDraftProductPhotoOriginal(supabase, parsed.data);
  } catch {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.upload.invalidRequest },
      { status: 400 },
    );
  }

  let compressed;
  try {
    compressed = await compressProductPhoto(original);
  } catch {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.upload.processingFailed },
      { status: 400 },
    );
  }

  const url = await uploadDraftProductPhoto(supabase, {
    draftId: parsed.data.draftId,
    side: parsed.data.side,
    file: new Blob([new Uint8Array(compressed.buffer)], { type: compressed.contentType }),
    extension: "jpg",
  });

  // 정리 실패는 등록 자체를 막을 이유가 없다 — 원본이 잠깐 더 남아있어도 무해하다
  deleteDraftProductPhotoOriginal(supabase, parsed.data).catch(() => {});

  return NextResponse.json({ url });
}

import { NextResponse } from "next/server";
import { productPhotoUploadSchema } from "@/lib/validation/upload";
import { uploadDraftProductPhoto } from "@/lib/db/productPhotos";
import { compressProductPhoto } from "@/lib/server/compressPhoto";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { API_ERROR_CODE, ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

export async function POST(request: Request) {
  const formData = await request.formData();

  const parsed = productPhotoUploadSchema.safeParse({
    draftId: formData.get("draftId"),
    side: formData.get("side"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: API_ERROR_CODE.VALIDATION_ERROR,
        message: parsed.error.issues[0]?.message ?? MESSAGES.upload.invalidRequest,
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.upload.fileRequired },
      { status: 400 },
    );
  }

  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.upload.unsupportedType },
      { status: 400 },
    );
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.upload.tooLarge },
      { status: 400 },
    );
  }

  let compressed;
  try {
    compressed = await compressProductPhoto(file);
  } catch {
    return NextResponse.json(
      { code: API_ERROR_CODE.VALIDATION_ERROR, message: MESSAGES.upload.processingFailed },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const url = await uploadDraftProductPhoto(supabase, {
    draftId: parsed.data.draftId,
    side: parsed.data.side,
    file: new Blob([new Uint8Array(compressed.buffer)], { type: compressed.contentType }),
    extension: "jpg",
  });

  return NextResponse.json({ url });
}

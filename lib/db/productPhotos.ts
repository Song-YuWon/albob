import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_PHOTOS_BUCKET_ID } from "@/lib/constants/codes";

interface DraftPhotoRef {
  draftId: string;
  side: "front" | "back";
}

// 클라이언트가 서명 URL로 직접 올리는 원본(압축 전) 경로 — 압축까지 끝나면 지운다.
function originalPath({ draftId, side }: DraftPhotoRef): string {
  return `drafts/${draftId}/${side}-original`;
}

interface UploadDraftPhotoParams extends DraftPhotoRef {
  file: Blob;
  extension: string;
}

// 등록 위저드 진행 중에는 아직 product 행이 없으므로, 클라이언트가 만든 draftId 아래에 임시로 올려둔다.
// 등록 완료 시 이 URL을 products.front_photo_url / back_photo_url에 그대로 저장한다 (파일 이동 없음).
export async function uploadDraftProductPhoto(
  supabase: SupabaseClient,
  { draftId, side, file, extension }: UploadDraftPhotoParams,
): Promise<string> {
  const path = `drafts/${draftId}/${side}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_PHOTOS_BUCKET_ID)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_PHOTOS_BUCKET_ID).getPublicUrl(path);
  return data.publicUrl;
}

// 브라우저가 Vercel 함수를 거치지 않고 Supabase Storage에 원본을 직접 올릴 수 있게, 이 경로 하나에만
// 유효한 업로드 토큰을 발급한다. upsert를 켜서 "다시 촬영하기"로 같은 side를 재업로드해도 덮어쓴다.
export async function createSignedDraftPhotoUploadUrl(
  supabase: SupabaseClient,
  ref: DraftPhotoRef,
): Promise<{ path: string; token: string }> {
  const path = originalPath(ref);
  const { data, error } = await supabase.storage
    .from(PRODUCT_PHOTOS_BUCKET_ID)
    .createSignedUploadUrl(path, { upsert: true });

  if (error) throw error;
  return { path, token: data.token };
}

// 압축 단계에서 방금 직접 업로드된 원본을 서버로 내려받는다.
export async function downloadDraftProductPhotoOriginal(
  supabase: SupabaseClient,
  ref: DraftPhotoRef,
): Promise<Blob> {
  const { data, error } = await supabase.storage.from(PRODUCT_PHOTOS_BUCKET_ID).download(originalPath(ref));
  if (error) throw error;
  return data;
}

// 압축본을 올린 뒤엔 원본이 더 필요 없다 — 실패해도 등록 자체를 막을 이유는 없어 호출부에서 무시 가능하게 던지지 않는다.
export async function deleteDraftProductPhotoOriginal(supabase: SupabaseClient, ref: DraftPhotoRef): Promise<void> {
  await supabase.storage.from(PRODUCT_PHOTOS_BUCKET_ID).remove([originalPath(ref)]);
}

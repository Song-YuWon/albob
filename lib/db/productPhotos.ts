import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_ID = "product-photos";

interface UploadDraftPhotoParams {
  draftId: string;
  side: "front" | "back";
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
    .from(BUCKET_ID)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_ID).getPublicUrl(path);
  return data.publicUrl;
}

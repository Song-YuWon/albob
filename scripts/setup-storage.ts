import { createClient } from "@supabase/supabase-js";

const BUCKET_ID = "product-photos";

function createScriptSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function main() {
  const supabase = createScriptSupabaseClient();

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const bucketOptions = {
    public: true,
    fileSizeLimit: "20MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  };

  if (buckets?.some((bucket) => bucket.id === BUCKET_ID)) {
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET_ID, bucketOptions);
    if (updateError) throw updateError;
    console.log(`업데이트 완료: "${BUCKET_ID}" 버킷 (public, 최대 20MB, jpeg/png/webp)`);
    return;
  }

  // 제품 사진은 민감 정보가 아니고 앱 안에서 바로 보여주는 용도라 public으로 둔다.
  // (베타 접근 자체는 로그인 게이트가 별도로 막고 있음)
  const { error: createError } = await supabase.storage.createBucket(BUCKET_ID, bucketOptions);

  if (createError) throw createError;
  console.log(`생성 완료: "${BUCKET_ID}" 버킷 (public, 최대 20MB, jpeg/png/webp)`);
}

main().catch((error) => {
  console.error("스토리지 설정 실패:", error);
  process.exit(1);
});

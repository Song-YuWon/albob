// 등록 위저드(클라이언트)에서 쓰는 fetch 래퍼 모음 — 각 등록 API 호출을 한 곳에 모아
// 컴포넌트들이 fetch/에러 처리 코드를 중복해서 갖지 않게 한다.
import { fetchJson } from "./fetchJson";
import { createSupabaseBrowserClient } from "./supabaseClient";
import { PRODUCT_PHOTOS_BUCKET_ID } from "@/lib/constants/codes";

// Vercel Functions는 요청 본문이 4.5MB로 제한돼 있어(사진은 최대 20MB) 서버를 거쳐 올릴 수
// 없다 — 서버에서 서명된 업로드 URL만 발급받고, 실제 파일 바이트는 브라우저에서 Supabase
// Storage로 직접 올린다. 압축(용량 절감)은 여전히 서버 몫이라, 직접 올린 원본을 서버가
// 내려받아 압축한 뒤 최종 자리에 다시 올리는 "마무리" 요청을 한 번 더 보낸다.
export async function uploadProductPhoto(params: {
  draftId: string;
  side: "front" | "back";
  file: File;
}): Promise<string> {
  const { path, token } = await fetchJson<{ path: string; token: string }>(
    "/api/uploads/product-photo/sign",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: params.draftId, side: params.side }),
    },
    "사진 업로드 준비에 실패했어요",
  );

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(PRODUCT_PHOTOS_BUCKET_ID).uploadToSignedUrl(path, token, params.file);
  if (error) throw new Error("사진 업로드에 실패했어요");

  const body = await fetchJson<{ url: string }>(
    "/api/uploads/product-photo/finalize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: params.draftId, side: params.side }),
    },
    "사진 처리에 실패했어요",
  );
  return body.url;
}

export interface OcrTag {
  rawText: string;
  status: "matched" | "unresolved";
  ingredientId: string | null;
  ingredientName: string | null;
}

export async function runRegistrationOcr(
  backPhotoUrl: string,
): Promise<{ ocrStatus: "success" | "failed"; tags: OcrTag[] }> {
  return fetchJson(
    "/api/registration/ocr",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ backPhotoUrl }) },
    "성분표 인식에 실패했어요",
  );
}

export interface IngredientSearchResultItem {
  id: string;
  name: string;
  status: "approved" | "pending";
}

export async function searchIngredientsApi(query: string): Promise<IngredientSearchResultItem[]> {
  const body = await fetchJson<{ results: IngredientSearchResultItem[] }>(
    `/api/ingredients/search?q=${encodeURIComponent(query)}`,
    undefined,
    "성분 검색에 실패했어요",
  );
  return body.results;
}

export async function requestIngredientApi(name: string): Promise<{ id: string; name: string }> {
  const body = await fetchJson<{ ingredient: { id: string; name: string } }>(
    "/api/ingredients/request",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) },
    "성분 추가 요청에 실패했어요",
  );
  return body.ingredient;
}

export async function createProductApi(payload: {
  name: string;
  brand: string;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  ingredientIds: string[];
}): Promise<{ productId: string }> {
  return fetchJson(
    "/api/products",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    "제품 등록에 실패했어요",
  );
}

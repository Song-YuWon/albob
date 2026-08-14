// 등록 위저드(클라이언트)에서 쓰는 fetch 래퍼 모음 — 각 등록 API 호출을 한 곳에 모아
// 컴포넌트들이 fetch/에러 처리 코드를 중복해서 갖지 않게 한다.
import { fetchJson } from "./fetchJson";

export async function uploadProductPhoto(params: {
  draftId: string;
  side: "front" | "back";
  file: File;
}): Promise<string> {
  const formData = new FormData();
  formData.append("draftId", params.draftId);
  formData.append("side", params.side);
  formData.append("file", params.file);

  const body = await fetchJson<{ url: string }>(
    "/api/uploads/product-photo",
    { method: "POST", body: formData },
    "사진 업로드에 실패했어요",
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

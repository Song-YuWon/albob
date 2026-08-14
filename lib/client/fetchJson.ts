// fetch() 자체가 던지는 에러(네트워크 끊김 등)는 브라우저 원문 영어 메시지("Failed to
// fetch")라 그대로 보여주면 안 된다 — 응답은 왔지만 실패한 경우와 fetch 자체가 실패한
// 경우 둘 다 여기서 한국어 fallbackMessage로 통일한다. 클라이언트에서 API를 호출하는
// 모든 곳(등록/수정/리뷰/로그인)이 이 한 곳을 통해서만 fetch하게 해서 에러 메시지가
// 화면마다 따로 새지 않게 한다.
export async function fetchJson<T>(
  input: string,
  init: RequestInit | undefined,
  fallbackMessage: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(fallbackMessage);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? fallbackMessage);
  }
  return body as T;
}

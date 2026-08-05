// crypto.randomUUID()는 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작한다.
// 로컬 네트워크 IP로 http 접속해 테스트하는 경우처럼 보안 컨텍스트가 아닐 때를 대비해
// crypto.getRandomValues(보안 컨텍스트 여부와 무관하게 항상 사용 가능)로 직접 UUID v4를 만든다.
// 등록 위저드의 draftId처럼 값 자체의 보안성이 중요하지 않은 임시 식별자용이라 이 정도면 충분하다.
export function generateDraftId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

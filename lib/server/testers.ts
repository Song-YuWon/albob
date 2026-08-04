import "server-only";

export interface BetaTester {
  id: string;
  password: string;
}

// BETA_TESTERS는 JSON 배열 문자열로 .env에 저장한다 — 파싱 실패 시 빈 배열로 안전하게 처리
function getBetaTesters(): BetaTester[] {
  const raw = process.env.BETA_TESTERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findTester(id: string, password: string): BetaTester | null {
  return getBetaTesters().find((t) => t.id === id && t.password === password) ?? null;
}

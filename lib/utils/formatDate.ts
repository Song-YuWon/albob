// DB에는 항상 UTC로 저장하고(타임스탬프 컬럼 timestamptz), 화면에 보여줄 때만 로컬 시간으로
// 변환한다 — CLAUDE.md 코드 규칙.
export function formatKoreanDate(isoString: string): string {
  const date = new Date(isoString);
  const parts = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(
    date,
  );
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

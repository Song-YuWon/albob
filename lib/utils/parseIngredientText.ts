// OCR 원문 텍스트 → 성분 후보 이름 목록.
// 퍼센트 표기(소수점 포함)를 먼저 지우고 나서 쉼표 등으로 나눈다 — 순서를 반대로 하면
// "1.2%"의 소수점이 구분자로 오인돼 숫자가 쪼개진다.
export function parseIngredientText(rawText: string): string[] {
  const cleaned = rawText
    .replace(/\([^)]*\)/g, "") // 괄호 안 내용(원산지 비율 등) 제거
    .replace(/\d+(\.\d+)?\s*%/g, ""); // 퍼센트 표기 제거

  return cleaned
    .split(/[,、.?\n]/) // Tesseract가 쉼표를 마침표(.)나 물음표(?)로 잘못 읽는 경우가 흔해 같이 구분자로 처리
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

// OCR 원문 텍스트 → 성분 후보 이름 목록. 실제 OCR(9단계)로 교체돼도 그대로 재사용한다.
export function parseIngredientText(rawText: string): string[] {
  return rawText
    .split(/[,、\n]/)
    .map((token) =>
      token
        .replace(/\([^)]*\)/g, "") // 괄호 안 내용(원산지 비율 등) 제거
        .replace(/\d+(\.\d+)?\s*%/g, "") // 퍼센트 표기 제거
        .trim(),
    )
    .filter((token) => token.length > 0);
}

import "server-only";

export type OcrResult = { status: "success"; rawText: string } | { status: "failed" };

// 실제 성분표 사진의 텍스트를 담고 있는 것처럼 구성한 샘플 — 각 샘플에 우리 성분 마스터에
// 없는 항목을 하나씩 섞어서 "미해결" 태그 흐름도 자연스럽게 테스트되게 한다.
const SAMPLE_LABELS = [
  "닭고기 50%, 현미, 옥수수글루텐밀, 연어오일, 타우린, 비타민E, 프로바이오틱스, 정제염",
  "오리고기, 완두콩, 감자, 아마씨, 로즈마리추출물, 비타민D3, 산화아연",
  "연어 40%, 고구마, 병아리콩, 해바라기씨오일, 글루코사민, 콘드로이친, 가수분해닭간",
];

// 실제 서비스에서는 이 함수가 Render에 배치한 PaddleOCR 서버를 호출하게 된다 (9단계에서 교체 예정).
// 지금은 등록 플로우 전체를 검증하기 위한 목업 — 인위적 지연과 확률적 인식 실패를 흉내낸다.
export async function runMockOcr(): Promise<OcrResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (Math.random() < 0.15) {
    return { status: "failed" };
  }

  const rawText = SAMPLE_LABELS[Math.floor(Math.random() * SAMPLE_LABELS.length)];
  return { status: "success", rawText };
}

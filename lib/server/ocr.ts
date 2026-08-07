import "server-only";
import { createWorker, PSM, type Worker } from "tesseract.js";

export type OcrResult = { status: "success"; rawText: string } | { status: "failed" };

// 프로세스당 워커 하나만 만들어서 재사용한다 — 매 요청마다 새로 만들면 WASM 엔진 초기화와
// 언어 데이터 로딩(첫 실행 시 다운로드)이 반복돼서 느려진다.
//
// 그레이스케일+대비 강화 전처리와 kor+eng 혼합 언어팩을 시도해봤는데 실측 결과 둘 다
// 오히려 인식률이 떨어져서(합성 테스트 이미지 기준) 되돌렸다 — 원본을 그대로 넘기는 게 제일 나았다.
// 반면 페이지 분할 모드는 기본값(AUTO)이 성분표처럼 빽빽한 텍스트 블록에서 줄 순서를
// 뒤죽박죽으로 읽어서, SINGLE_BLOCK/SPARSE_TEXT 둘 다 시도해봤다. 처음엔 SPARSE_TEXT가
// 더 나쁜 것처럼 보였지만, 그건 당시 쉼표 오인식(.,?로 잘못 읽힘) 파싱을 안 고쳤을 때라
// 태그가 안 쪼개져서 그렇게 보였을 뿐 — 파싱 수정(parseIngredientText.ts) 후 다시 비교해서
// SPARSE_TEXT로 최종 결정.
let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("kor")
      .then(async (worker) => {
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
        return worker;
      })
      .catch((error: unknown) => {
        workerPromise = null; // 실패하면 다음 요청에서 다시 시도할 수 있게 초기화
        throw error;
      });
  }
  return workerPromise;
}

// Tesseract.js(WASM, 우리 Node 서버 프로세스 안에서 직접 실행)로 성분표 사진의 텍스트를 인식한다.
// PaddleOCR보다 한국어 인식률은 떨어지지만 별도 서버가 필요 없어 호스팅 비용·메모리 문제가 없다.
// OCR은 실패해도 등록 자체를 막지 않는 보조 기능(태그 없이 계속하기)이라 이 트레이드오프를 감안한다.
export async function runOcr(imageUrl: string): Promise<OcrResult> {
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(imageUrl);
    const rawText = data.text.trim();

    if (!rawText) {
      console.error("OCR 결과에 인식된 텍스트가 없음");
      return { status: "failed" };
    }

    return { status: "success", rawText };
  } catch (error) {
    console.error("OCR 인식 중 에러:", error);
    return { status: "failed" };
  }
}

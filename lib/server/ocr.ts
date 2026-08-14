import "server-only";
import path from "node:path";
import { createWorker, OEM, PSM, type Worker } from "tesseract.js";

// 배포 환경(Vercel Functions 등)은 파일시스템이 읽기 전용이라, 언어 데이터를 CDN에서
// 받아와 캐시로 쓰려는 기본 동작이 실패한다(콘솔에 에러 로그만 남고 동작 자체는 안 깨지긴
// 하지만, 매 콜드스타트마다 불필요한 네트워크 요청 실패가 반복된다). langPath로 배포
// 번들에 같이 포함시킨 로컬 파일을 직접 가리키고, cacheMethod: "none"으로 캐시 읽기/쓰기
// 시도 자체를 꺼서 그 문제를 원천적으로 없앤다.
const LANG_PATH = path.join(process.cwd(), "lib/server/tessdata");

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
    workerPromise = createWorker("kor", OEM.LSTM_ONLY, {
      langPath: LANG_PATH,
      gzip: false,
      cacheMethod: "none",
    })
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

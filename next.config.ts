import type { NextConfig } from "next";
import { MAX_PHOTO_SIZE_BYTES } from "./lib/constants/codes";

const nextConfig: NextConfig = {
  // 개발 중 같은 Wi-Fi의 휴대폰 등에서 접속해 테스트할 수 있게 허용 — 프로덕션에는 영향 없음
  allowedDevOrigins: ["172.29.97.130"],
  // 화면 좌하단에 뜨는 Next.js 개발용 라우트 인디케이터 — 개발 전용 UI라 프로덕션엔 어차피 안 보이지만 거슬려서 끔
  devIndicators: false,
  // tesseract.js는 Node worker_threads로 자기 워커 스크립트 파일을 런타임에 직접 찾는데,
  // Next.js가 번들링하면 그 경로가 깨져서 워커를 못 찾는다 — 번들링 제외하고 일반 require로 로드.
  // tesseract.js-core(실제 OCR 엔진, WASM)도 CPU 기능(SIMD 등)에 따라 여러 .wasm 파일 중
  // 런타임에 하나를 골라 읽는 구조라 마찬가지로 웹팩 번들링에서 제외해야 한다.
  serverExternalPackages: ["tesseract.js", "tesseract.js-core"],
  // Next의 자동 파일 추적(nft)은 import/require만 정적으로 분석하는데, 아래 두 가지는 모두
  // tesseract.js 내부에서 런타임에 조합한 문자열 경로로 읽어서 자동으로 못 잡는다 — 배포 번들에
  // 명시적으로 포함시켜야 한다.
  // - lib/server/tessdata: 한국어 언어 데이터(langPath가 가리키는 파일)
  // - tesseract.js-core의 .wasm들: 실제 OCR 엔진 바이너리. 어떤 CPU 기능 조합(simd/relaxedsimd
  //   /lstm 등)의 .wasm이 런타임에 선택될지 몰라서 전부 포함(Vercel 배포에서 이걸 안 하면
  //   "ENOENT: tesseract-core-relaxedsimd.wasm" 같은 에러로 OCR 요청이 그대로 멈춰버림)
  outputFileTracingIncludes: {
    "/api/registration/ocr": ["./lib/server/tessdata/**/*", "./node_modules/tesseract.js-core/**/*"],
  },
  experimental: {
    // proxy(세션 게이트)가 요청 본문을 기본 10MB까지만 버퍼링해서 그 이상인 원본 사진은
    // 라우트 핸들러에 닿기 전에 잘려 FormData 파싱이 깨졌다 — 업로드 제한(20MB)만큼 여유를 둔다
    proxyClientMaxBodySize: MAX_PHOTO_SIZE_BYTES + 1024 * 1024,
  },
};

export default nextConfig;

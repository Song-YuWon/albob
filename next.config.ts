import type { NextConfig } from "next";
import { MAX_PHOTO_SIZE_BYTES } from "./lib/constants/codes";

const nextConfig: NextConfig = {
  // 개발 중 같은 Wi-Fi의 휴대폰 등에서 접속해 테스트할 수 있게 허용 — 프로덕션에는 영향 없음
  allowedDevOrigins: ["172.30.1.5"],
  experimental: {
    // proxy(세션 게이트)가 요청 본문을 기본 10MB까지만 버퍼링해서 그 이상인 원본 사진은
    // 라우트 핸들러에 닿기 전에 잘려 FormData 파싱이 깨졌다 — 업로드 제한(20MB)만큼 여유를 둔다
    proxyClientMaxBodySize: MAX_PHOTO_SIZE_BYTES + 1024 * 1024,
  },
};

export default nextConfig;

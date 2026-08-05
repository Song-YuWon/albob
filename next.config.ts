import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 같은 Wi-Fi의 휴대폰 등에서 접속해 테스트할 수 있게 허용 — 프로덕션에는 영향 없음
  allowedDevOrigins: ["172.30.1.5"],
};

export default nextConfig;

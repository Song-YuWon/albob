import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import "./globals.css";

const gowunBatang = Gowun_Batang({
  variable: "--font-gowun-batang",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "알밥 — 알고 먹이는 밥그릇",
  description: "반려동물 사료 성분 등록·검색 서비스",
};

// interactiveWidget: "resizes-content" — 기본값(resizes-visual)에서는 안드로이드 Chrome이
// 키보드를 열 때 레이아웃 뷰포트(dvh 계산 기준)는 그대로 두고 화면만 가려서, 바텀시트의
// 고정 하단 버튼이 키보드에 가려진다. resizes-content로 바꿔야 dvh가 키보드 높이만큼 줄어든다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${gowunBatang.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">{children}</body>
    </html>
  );
}

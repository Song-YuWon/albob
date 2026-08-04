import type { Metadata } from "next";
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

"use client";

import { useRouter } from "next/navigation";

// 항상 홈으로 보내는 링크 대신 브라우저 히스토리를 한 단계 되돌려서,
// 검색 결과에서 들어온 경우 검색 결과로, 홈에서 들어온 경우 홈으로 자연스럽게 돌아가게 한다.
export function BackButton() {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} aria-label="뒤로가기">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 6L9 12L15 18" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

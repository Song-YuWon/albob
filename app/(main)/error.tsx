"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState/ErrorState";

// (main) 세그먼트(검색/상세/수정/리뷰 등) 전체를 감싸는 에러 바운더리 — 서버 컴포넌트의
// DB 조회가 실패해도 Next 기본 크래시 화면 대신 공용 ErrorState를 보여준다.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState onRetry={unstable_retry} />;
}

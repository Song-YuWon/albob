"use client";

import { useEffect, useRef } from "react";

// 안드로이드 뒤로가기(제스처/버튼)를 누르면 이전 화면으로 가지 않고 시트만 닫히게 —
// 시트가 열릴 때 더미 히스토리를 하나 쌓아두고, 그걸 pop하는 뒤로가기를 가로채서 닫기만 한다.
export function useDismissOnBackNavigation(onClose: () => void) {
  // 뒤로가기로 닫힐 때는 popstate가 이미 히스토리를 되돌린 상태라 정리(history.back())가
  // 필요 없다 — 그 외(바깥 클릭, 항목 선택, 드래그 닫기 등)로 닫힐 때만 우리가 쌓아둔
  // 더미 엔트리를 되돌려줘야 뒤로가기를 두 번 눌러야 하는 상황을 막을 수 있다.
  const closedViaPopStateRef = useRef(false);
  // 개발 모드 StrictMode는 effect를 마운트→클린업→재마운트로 두 번 실행한다. 클린업에서
  // 곧바로 history.back()을 부르면 그 결과 popstate가 비동기로 발생해 재마운트 시점의
  // 리스너를 오작동시켜 시트가 열리자마자 닫혀버린다. 그래서 클린업은 history.back()을
  // 다음 틱으로 미뤄두고, 재마운트가 그 예약을 취소하는 방식으로 "진짜 언마운트"만 반영한다.
  const pendingHistoryBackRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingHistoryBackRef.current !== null) {
      window.clearTimeout(pendingHistoryBackRef.current);
      pendingHistoryBackRef.current = null;
    } else {
      window.history.pushState({ tagSearchSheet: true }, "");
    }

    const handlePopState = () => {
      closedViaPopStateRef.current = true;
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!closedViaPopStateRef.current) {
        pendingHistoryBackRef.current = window.setTimeout(() => {
          pendingHistoryBackRef.current = null;
          window.history.back();
        }, 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

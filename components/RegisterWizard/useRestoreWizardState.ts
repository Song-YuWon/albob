"use client";

import { useEffect, useState } from "react";
import { clearPersistedWizardState, loadPersistedWizardState } from "./persistence";
import type { WizardStep, WizardTag } from "./types";

interface RestoreHandlers {
  setDraftId: (id: string) => void;
  setStep: (step: WizardStep) => void;
  setFrontPhotoUrl: (url: string | null) => void;
  setBackPhotoUrl: (url: string | null) => void;
  setTags: (tags: WizardTag[]) => void;
  setName: (name: string) => void;
  setBrand: (brand: string) => void;
  startOcr: (backUrl: string) => void;
}

// 안드로이드가 메모리 확보를 위해 탭을 통째로 새로고침(navigation type "reload")했을 때만
// 복구한다. 사용자가 화면을 벗어났다가 다시 들어온 경우(navigate/back_forward)는 새로
// 시작하는 게 맞으므로 복구하지 않고, 남아있던 draft도 지운다.
function isTabReload(): boolean {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return false;
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type === "reload";
}

// sessionStorage는 서버(SSR) 렌더링 시엔 항상 비어있고 클라이언트에서만 값이 있을 수 있다.
// 이 값을 state 초기값으로 바로 쓰면 서버가 그린 HTML과 클라이언트의 첫 렌더 결과가 달라져
// 하이드레이션 에러가 난다. 그래서 마운트 이후(하이드레이션이 끝난 뒤)에만 복구를 적용한다.
// 반환값 hasHydrated는 복구 적용 전까지 자동저장이 예전 상태를 덮어쓰지 않게 막는 용도.
export function useRestoreWizardState(handlers: RestoreHandlers): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const persisted = isTabReload() ? loadPersistedWizardState() : null;
    if (!persisted) clearPersistedWizardState();

    const timer = setTimeout(() => {
      if (persisted) {
        if (persisted.draftId) handlers.setDraftId(persisted.draftId);
        if (persisted.frontPhotoUrl !== undefined) handlers.setFrontPhotoUrl(persisted.frontPhotoUrl);
        if (persisted.backPhotoUrl !== undefined) handlers.setBackPhotoUrl(persisted.backPhotoUrl);
        if (persisted.tags) handlers.setTags(persisted.tags);
        if (persisted.name) handlers.setName(persisted.name);
        if (persisted.brand) handlers.setBrand(persisted.brand);

        // 복구된 상태가 하필 "OCR 처리 중"이었다면 요청이 유실된 것이므로 다시 시작한다
        if (persisted.step === "ocr" && persisted.backPhotoUrl) {
          handlers.startOcr(persisted.backPhotoUrl);
        } else if (persisted.step) {
          handlers.setStep(persisted.step);
        }
      }
      setHasHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hasHydrated;
}

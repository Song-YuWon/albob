"use client";

import { useEffect } from "react";
import { clearPersistedWizardState } from "./persistence";
import { generateDraftId } from "@/lib/utils/generateId";
import type { WizardStep, WizardTag } from "./types";

interface ResetHandlers {
  setDraftId: (id: string) => void;
  setStep: (step: WizardStep) => void;
  setFrontPhotoUrl: (url: string | null) => void;
  setBackPhotoUrl: (url: string | null) => void;
  setTags: (tags: WizardTag[]) => void;
  setSearchTarget: (target: null) => void;
  setName: (name: string) => void;
  setBrand: (brand: string) => void;
}

// 브라우저의 bfcache(뒤로/앞으로 가기 캐시)는 페이지를 완전히 얼려뒀다가 그대로 되살린다 —
// 마운트가 다시 일어나지 않아 useRestoreWizardState의 "새로고침인지" 판단 자체가 실행되지
// 않고, 등록 화면을 벗어났다 되돌아왔을 뿐인데 사진·태그가 그대로 복원돼버린다. 등록 화면을
// 완전히 벗어났다가 되돌아온 경우엔 항상 새로 시작해야 하므로, bfcache 복원(pageshow의
// event.persisted)을 감지하면 여기서 직접 초기 상태로 되돌린다.
export function useResetOnBfcacheRestore(handlers: ResetHandlers, initialName: string) {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      clearPersistedWizardState();
      handlers.setDraftId(generateDraftId());
      handlers.setStep("photo-front");
      handlers.setFrontPhotoUrl(null);
      handlers.setBackPhotoUrl(null);
      handlers.setTags([]);
      handlers.setSearchTarget(null);
      handlers.setName(initialName);
      handlers.setBrand("");
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName]);
}

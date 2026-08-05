"use client";

import { useEffect } from "react";
import { savePersistedWizardState, type PersistedWizardState } from "./persistence";

// 상태가 바뀔 때마다 sessionStorage에 저장 — 탭이 새로고침돼도 이어서 진행할 수 있게 한다.
// enabled가 false인 동안(복구 적용 전)에는 저장하지 않는다 — 그렇지 않으면 마운트 직후
// 기본값으로 먼저 저장이 일어나 복구 대상이었던 이전 진행 상황을 덮어써버린다.
export function useAutoSaveWizardState(state: PersistedWizardState, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (state.step === "done") return;
    savePersistedWizardState(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, state.draftId, state.step, state.frontPhotoUrl, state.backPhotoUrl, state.tags, state.name, state.brand]);
}

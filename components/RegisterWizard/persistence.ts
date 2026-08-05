import type { WizardStep, WizardTag } from "./types";

// 안드로이드에서 카메라 앱을 쓰는 동안 브라우저가 메모리 확보를 위해 탭을 새로고침하는 경우가
// 있다 — 이때 리액트 state(진행 중인 등록 정보)가 통째로 날아간다. sessionStorage에 진행
// 상황을 틈틈이 저장해뒀다가, 새로고침되면 그 시점부터 이어서 진행할 수 있게 한다.
const STORAGE_KEY = "albob-register-draft";

export interface PersistedWizardState {
  draftId: string;
  step: WizardStep;
  frontPhotoUrl: string | null;
  backPhotoUrl: string | null;
  tags: WizardTag[];
  name: string;
  brand: string;
}

export function loadPersistedWizardState(): Partial<PersistedWizardState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePersistedWizardState(state: PersistedWizardState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패해도 등록 자체는 계속 진행 가능해야 하므로 조용히 무시 — 복구 기능만 없어짐
  }
}

export function clearPersistedWizardState(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

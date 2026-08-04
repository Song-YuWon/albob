export const SESSION_COOKIE_NAME = "albob_session";

// 베타 세션 유효기간 — 테스트 편의를 위해 7일로 설정, 필요 시 조정
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const API_ERROR_CODE = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

// 성분 마스터 상태 — approved: 운영자 사전 등록 / pending: 사용자 "추가 요청"으로 생성된 미승인 성분
export const INGREDIENT_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
} as const;

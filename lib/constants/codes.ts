export const SESSION_COOKIE_NAME = "albob_session";

// 베타 세션 유효기간 — 테스트 편의를 위해 7일로 설정, 필요 시 조정
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const API_ERROR_CODE = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
} as const;

// 성분 마스터 상태 — approved: 운영자 사전 등록 / pending: 사용자 "추가 요청"으로 생성된 미승인 성분
export const INGREDIENT_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
} as const;

// 성분표 사진 — 앞면(제품명)/뒷면(성분표) 2장
export const PRODUCT_PHOTO_SIDE = {
  FRONT: "front",
  BACK: "back",
} as const;

// 클라이언트 압축 없이 원본을 그대로 올리므로 여유 있게 잡는다 (서버에서 저장 전 재압축)
export const MAX_PHOTO_SIZE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// 서버 압축(업로드 라우트) — 긴 변 상한과 JPEG 품질. OCR(뒷면 성분표) 인식에 지장 없을 정도로 여유 있게 잡는다
export const PHOTO_MAX_DIMENSION_PX = 2000;
export const PHOTO_JPEG_QUALITY = 85;

// 태그 상태 — 3.1 매칭됨/미해결/요청됨
export const TAG_STATUS = {
  MATCHED: "matched",
  UNRESOLVED: "unresolved",
  REQUESTED: "requested",
} as const;

// 리뷰 별점 범위(5점 만점)와 코멘트 길이 상한
export const REVIEW_RATING_MIN = 1;
export const REVIEW_RATING_MAX = 5;
export const REVIEW_COMMENT_MAX_LENGTH = 1000;

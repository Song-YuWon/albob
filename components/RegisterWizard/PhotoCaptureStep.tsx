"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { MESSAGES } from "@/lib/constants/messages";

interface PhotoCaptureStepProps {
  guideText: string;
  photoStepLabel: string; // "1 / 2", "2 / 2" — 앞/뒤 두 장 중 몇 번째인지 (도트 단계와는 별개)
  previousThumbnailUrl?: string | null;
  onCaptured: (file: File) => void;
  onEditPreviousPhoto?: () => void;
  isUploading: boolean;
  errorMessage: string | null;
}

const SLOW_HINT_DELAY_MS = 6000;

export function PhotoCaptureStep({
  guideText,
  photoStepLabel,
  previousThumbnailUrl,
  onCaptured,
  onEditPreviousPhoto,
  isUploading,
  errorMessage,
}: PhotoCaptureStepProps) {
  const [showSlowHint, setShowSlowHint] = useState(false);

  // 처리가 오래 걸릴 때 "아직 되는 중이다"를 명확히 알려주기 위한 지연 안내
  // (렌더 조건에서 isUploading도 같이 확인하므로, 여기서는 끝났을 때 굳이 false로 되돌리지 않아도 된다)
  useEffect(() => {
    if (!isUploading) return;
    const timer = setTimeout(() => setShowSlowHint(true), SLOW_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isUploading]);

  // 원본 파일을 그대로 넘긴다 — 전처리(HEIC 변환/리사이즈)는 위저드 쪽 핸들러의
  // try/catch 안에서 실행돼야 실패했을 때 화면에 에러가 제대로 뜬다.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 change가 발생하도록 초기화
    if (!file) return;
    onCaptured(file);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-surface-2 px-3 py-1 font-body text-[11px] font-bold text-ink-soft">
        사진 {photoStepLabel}
      </span>

      {previousThumbnailUrl && (
        <button
          type="button"
          onClick={onEditPreviousPhoto}
          className="flex items-center gap-2 rounded-full border border-primary bg-surface px-3 py-1.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previousThumbnailUrl}
            alt=""
            className="h-[38px] w-[38px] rounded-full object-cover"
          />
          <span className="font-body text-xs text-ink-soft">{MESSAGES.registration.frontCaptureDone}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20L4.6 16.4L16 5C16.5523 4.44772 17.4477 4.44772 18 5L19 6C19.5523 6.55228 19.5523 7.44772 19 8L7.6 19.4L4 20Z"
              stroke="var(--ink-soft)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* 카메라를 직접 여는 대신 갤러리에서 사진을 선택하게 한다 — 촬영 직후 카메라 앱이 뜬 동안
          모바일 브라우저 탭이 메모리 확보를 위해 새로고침되면서 진행 상황이 끊기는 문제가 있어,
          더 가벼운 갤러리 선택 방식으로 바꿨다. label로 감싸서 사용자가 input을 직접 누르는
          형태(브라우저 표준 동작)를 그대로 유지한다. */}
      <label
        className={`flex h-56 w-full max-w-xs flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary bg-surface-2 ${
          isUploading ? "opacity-60" : "cursor-pointer"
        }`}
      >
        {isUploading ? (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-primary" />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--ink-soft)" strokeWidth="2" />
            <circle cx="8.5" cy="9.5" r="1.5" stroke="var(--ink-soft)" strokeWidth="2" />
            <path
              d="M4 17L9 12L12 15L16 10L20 15"
              stroke="var(--ink-soft)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className="font-body text-sm font-bold text-ink">
          {isUploading ? MESSAGES.registration.uploading : MESSAGES.registration.tapToCapture}
        </span>
        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleChange}
          disabled={isUploading}
          className="sr-only"
        />
      </label>

      {isUploading && showSlowHint && (
        <p className="font-body text-xs text-ink-soft">{MESSAGES.registration.uploadingSlowHint}</p>
      )}

      {!isUploading && <p className="font-body text-sm leading-relaxed text-ink-soft">{guideText}</p>}

      {errorMessage && <p className="font-body text-[11.5px] text-danger">{errorMessage}</p>}
    </div>
  );
}

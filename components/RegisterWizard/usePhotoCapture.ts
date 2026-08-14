"use client";

import { useState } from "react";
import { MESSAGES } from "@/lib/constants/messages";
import { uploadProductPhoto } from "@/lib/client/registrationApi";
import { prepareProductPhoto } from "@/lib/utils/imageProcessing";
import { savePersistedWizardState, type PersistedWizardState } from "./persistence";
import type { WizardStep } from "./types";

interface PhotoCaptureDeps {
  draftId: string;
  frontPhotoUrl: string | null;
  backPhotoUrl: string | null;
  setFrontPhotoUrl: (url: string | null) => void;
  setBackPhotoUrl: (url: string | null) => void;
  setStep: (step: WizardStep) => void;
  restOfPersistedState: Pick<PersistedWizardState, "tags" | "name" | "brand">;
  startOcr: (backUrl: string) => Promise<void>;
}

export function usePhotoCapture({
  draftId,
  frontPhotoUrl,
  backPhotoUrl,
  setFrontPhotoUrl,
  setBackPhotoUrl,
  setStep,
  restOfPersistedState,
  startOcr,
}: PhotoCaptureDeps) {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // 전처리(HEIC 변환/리사이즈) 실패는 브라우저가 던지는 원문 메시지 대신
  // 사용자가 이해할 수 있는 문구로 바꿔서 보여준다
  const preparePhotoOrThrowFriendly = async (file: File): Promise<File> => {
    try {
      return await prepareProductPhoto(file);
    } catch {
      throw new Error(MESSAGES.upload.processingFailed);
    }
  };

  const handleFrontCaptured = async (file: File) => {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const prepared = await preparePhotoOrThrowFriendly(file);
      const url = await uploadProductPhoto({ draftId, side: "front", file: prepared });
      setFrontPhotoUrl(url);
      setStep("photo-back");
      // 업로드 직후 바로 저장 — 뒷면 사진 선택 중 탭이 새로고침돼도 이 체크포인트부터
      // 복구되게 한다. useEffect 기반 자동저장은 렌더 사이클을 기다려야 해서 타이밍이 늦을 수 있다.
      savePersistedWizardState({ draftId, step: "photo-back", frontPhotoUrl: url, backPhotoUrl, ...restOfPersistedState });
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : MESSAGES.upload.invalidRequest);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleBackCaptured = async (file: File) => {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const prepared = await preparePhotoOrThrowFriendly(file);
      const url = await uploadProductPhoto({ draftId, side: "back", file: prepared });
      setBackPhotoUrl(url);
      // OCR 요청을 보내기 전에 먼저 저장 — OCR 요청 도중 탭이 새로고침돼도
      // useRestoreWizardState가 backPhotoUrl로 OCR을 자동으로 다시 시작한다.
      savePersistedWizardState({ draftId, step: "ocr", frontPhotoUrl, backPhotoUrl: url, ...restOfPersistedState });
      await startOcr(url);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : MESSAGES.upload.invalidRequest);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRetake = () => {
    setBackPhotoUrl(null);
    setStep("photo-back");
  };

  const handleEditFrontPhoto = () => {
    setPhotoError(null);
    setStep("photo-front");
  };

  return {
    isUploadingPhoto,
    photoError,
    handleFrontCaptured,
    handleBackCaptured,
    handleRetake,
    handleEditFrontPhoto,
  };
}

"use client";

import { useState } from "react";
import { MESSAGES } from "@/lib/constants/messages";
import { uploadProductPhoto, runRegistrationOcr, createProductApi } from "@/lib/client/registrationApi";
import { generateDraftId } from "@/lib/utils/generateId";
import { prepareProductPhoto } from "@/lib/utils/imageProcessing";
import { clearPersistedWizardState, savePersistedWizardState } from "./persistence";
import { useAutoSaveWizardState } from "./useAutoSaveWizardState";
import { useRestoreWizardState } from "./useRestoreWizardState";
import { nextTagKey, toWizardTags } from "./tagHelpers";
import type { WizardStep, WizardTag } from "./types";

interface SearchTarget {
  tagKey: string | null; // null = 새 태그 추가, 값 있으면 해당 태그 교체
  initialQuery: string;
}

export function useRegisterWizard(initialName: string) {
  // 서버 렌더링과 동일한 기본값으로 시작한다 — sessionStorage 복구는 useRestoreWizardState가
  // 하이드레이션 이후에만 적용한다 (그렇지 않으면 서버/클라이언트 렌더 결과가 달라진다).
  const [step, setStep] = useState<WizardStep>("photo-front");
  const [draftId, setDraftId] = useState(() => generateDraftId());

  const [frontPhotoUrl, setFrontPhotoUrl] = useState<string | null>(null);
  const [backPhotoUrl, setBackPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [ocrStatus, setOcrStatus] = useState<"processing" | "failed">("processing");
  const [tags, setTags] = useState<WizardTag[]>([]);
  const [searchTarget, setSearchTarget] = useState<SearchTarget | null>(null);

  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const startOcr = async (backUrl: string) => {
    setStep("ocr");
    setOcrStatus("processing");
    try {
      const result = await runRegistrationOcr(backUrl);
      if (result.ocrStatus === "failed") {
        setOcrStatus("failed");
        return;
      }
      setTags(toWizardTags(result.tags));
      setStep("tags");
    } catch {
      setOcrStatus("failed");
    }
  };

  const hasHydrated = useRestoreWizardState({
    setDraftId,
    setStep,
    setFrontPhotoUrl,
    setBackPhotoUrl,
    setTags,
    setName,
    setBrand,
    startOcr,
  });

  useAutoSaveWizardState({ draftId, step, frontPhotoUrl, backPhotoUrl, tags, name, brand }, hasHydrated);

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
      savePersistedWizardState({ draftId, step: "photo-back", frontPhotoUrl: url, backPhotoUrl, tags, name, brand });
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
      savePersistedWizardState({ draftId, step: "ocr", frontPhotoUrl, backPhotoUrl: url, tags, name, brand });
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

  const handleContinueWithoutTags = () => {
    setTags([]);
    setStep("tags");
  };

  const handleTagClick = (tagKey: string) => {
    const tag = tags.find((t) => t.key === tagKey);
    setSearchTarget({ tagKey, initialQuery: tag?.rawText ?? "" });
  };

  const handleAddTag = () => setSearchTarget({ tagKey: null, initialQuery: "" });

  const applyTagResult = (ingredient: { id: string; name: string }, status: "matched" | "requested") => {
    setTags((prev) => {
      if (searchTarget?.tagKey) {
        return prev.map((tag) =>
          tag.key === searchTarget.tagKey
            ? { ...tag, status, ingredientId: ingredient.id, ingredientName: ingredient.name }
            : tag,
        );
      }
      return [
        ...prev,
        { key: nextTagKey(), rawText: ingredient.name, status, ingredientId: ingredient.id, ingredientName: ingredient.name },
      ];
    });
    setSearchTarget(null);
  };

  const handleSubmit = async () => {
    if (!frontPhotoUrl || !backPhotoUrl) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { productId } = await createProductApi({
        name,
        brand,
        frontPhotoUrl,
        backPhotoUrl,
        ingredientIds: tags.map((tag) => tag.ingredientId).filter((id): id is string => Boolean(id)),
      });
      setCreatedProductId(productId);
      setStep("done");
      clearPersistedWizardState();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "등록에 실패했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    frontPhotoUrl,
    backPhotoUrl,
    isUploadingPhoto,
    photoError,
    ocrStatus,
    tags,
    searchTarget,
    name,
    brand,
    isSubmitting,
    submitError,
    createdProductId,
    setName,
    setBrand,
    setSearchTarget,
    handleFrontCaptured,
    handleBackCaptured,
    handleRetake,
    handleContinueWithoutTags,
    handleTagClick,
    handleAddTag,
    applyTagResult,
    handleSubmit,
    goToInfoStep: () => setStep("info"),
  };
}

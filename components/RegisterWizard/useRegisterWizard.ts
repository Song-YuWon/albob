"use client";

import { useState } from "react";
import { runRegistrationOcr, createProductApi } from "@/lib/client/registrationApi";
import { generateDraftId } from "@/lib/utils/generateId";
import { clearPersistedWizardState } from "./persistence";
import { useAutoSaveWizardState } from "./useAutoSaveWizardState";
import { useRestoreWizardState } from "./useRestoreWizardState";
import { useResetOnBfcacheRestore } from "./useResetOnBfcacheRestore";
import { usePhotoCapture } from "./usePhotoCapture";
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

  useResetOnBfcacheRestore(
    { setDraftId, setStep, setFrontPhotoUrl, setBackPhotoUrl, setTags, setSearchTarget, setName, setBrand },
    initialName,
  );

  const {
    isUploadingPhoto,
    photoError,
    handleFrontCaptured,
    handleBackCaptured,
    handleRetake,
    handleEditFrontPhoto,
  } = usePhotoCapture({
    draftId,
    frontPhotoUrl,
    backPhotoUrl,
    setFrontPhotoUrl,
    setBackPhotoUrl,
    setStep,
    restOfPersistedState: { tags, name, brand },
    startOcr,
  });

  const handleExitToHome = () => {
    clearPersistedWizardState();
  };

  const handleContinueWithoutTags = () => {
    setTags([]);
    setStep("tags");
  };

  const handleTagClick = (tagKey: string) => {
    const tag = tags.find((t) => t.key === tagKey);
    // 한 번이라도 성분이 확정됐으면 그 이름을 채워야 한다 — rawText는 OCR 원문 그대로라
    // 수정 후 다시 열면 예전 값이 나타나는 문제가 있었다 (TagChip 라벨 표시와 같은 우선순위)
    setSearchTarget({ tagKey, initialQuery: tag?.ingredientName ?? tag?.rawText ?? "" });
  };

  const handleAddTag = () => setSearchTarget({ tagKey: null, initialQuery: "" });

  const handleDeleteTag = () => {
    if (!searchTarget?.tagKey) return;
    setTags((prev) => prev.filter((tag) => tag.key !== searchTarget.tagKey));
    setSearchTarget(null);
  };

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
    handleEditFrontPhoto,
    handleExitToHome,
    handleContinueWithoutTags,
    handleTagClick,
    handleAddTag,
    handleDeleteTag,
    applyTagResult,
    handleSubmit,
    goToInfoStep: () => setStep("info"),
  };
}

"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo/Logo";
import { ProgressDots } from "./ProgressDots";
import { PhotoCaptureStep } from "./PhotoCaptureStep";
import { OcrStep } from "./OcrStep";
import { TagsStep } from "./TagsStep";
import { TagSearchSheet } from "./TagSearchSheet";
import { InfoStep } from "./InfoStep";
import { DoneStep } from "./DoneStep";
import { MESSAGES } from "@/lib/constants/messages";
import { useRegisterWizard } from "./useRegisterWizard";

interface RegisterWizardProps {
  initialName: string;
  testerId: string;
}

export function RegisterWizard({ initialName, testerId }: RegisterWizardProps) {
  const wizard = useRegisterWizard(initialName);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <header className="flex items-center justify-center pt-6">
        <Link href="/" onClick={wizard.handleExitToHome} className="flex items-center gap-2" aria-label="홈으로">
          <Logo size="compact" />
          <p className="font-display text-[19px] font-bold text-ink">알밥</p>
        </Link>
      </header>

      {wizard.step !== "done" && <ProgressDots step={wizard.step} />}

      {wizard.step === "photo-front" && (
        <PhotoCaptureStep
          guideText={MESSAGES.registration.frontGuide}
          photoStepLabel="1 / 2"
          onCaptured={wizard.handleFrontCaptured}
          isUploading={wizard.isUploadingPhoto}
          errorMessage={wizard.photoError}
        />
      )}

      {wizard.step === "photo-back" && (
        <PhotoCaptureStep
          guideText={MESSAGES.registration.backGuide}
          photoStepLabel="2 / 2"
          previousThumbnailUrl={wizard.frontPhotoUrl}
          onCaptured={wizard.handleBackCaptured}
          onEditPreviousPhoto={wizard.handleEditFrontPhoto}
          isUploading={wizard.isUploadingPhoto}
          errorMessage={wizard.photoError}
        />
      )}

      {wizard.step === "ocr" && (
        <OcrStep
          status={wizard.ocrStatus}
          onRetake={wizard.handleRetake}
          onContinueWithoutTags={wizard.handleContinueWithoutTags}
        />
      )}

      {wizard.step === "tags" && (
        <TagsStep
          tags={wizard.tags}
          onTagClick={wizard.handleTagClick}
          onAddTag={wizard.handleAddTag}
          onNext={wizard.goToInfoStep}
        />
      )}

      {wizard.step === "info" && (
        <InfoStep
          name={wizard.name}
          brand={wizard.brand}
          onNameChange={wizard.setName}
          onBrandChange={wizard.setBrand}
          frontPhotoUrl={wizard.frontPhotoUrl}
          isSubmitting={wizard.isSubmitting}
          errorMessage={wizard.submitError}
          onSubmit={wizard.handleSubmit}
        />
      )}

      {wizard.step === "done" && wizard.createdProductId && (
        <DoneStep productId={wizard.createdProductId} testerId={testerId} />
      )}

      {wizard.searchTarget && (
        <TagSearchSheet
          initialQuery={wizard.searchTarget.initialQuery}
          onSelect={(ingredient) => wizard.applyTagResult(ingredient, "matched")}
          onRequestNew={(ingredient) => wizard.applyTagResult(ingredient, "requested")}
          onClose={() => wizard.setSearchTarget(null)}
          onDelete={wizard.searchTarget.tagKey ? wizard.handleDeleteTag : undefined}
        />
      )}
    </div>
  );
}

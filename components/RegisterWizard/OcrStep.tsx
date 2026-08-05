"use client";

import { MESSAGES } from "@/lib/constants/messages";

interface OcrStepProps {
  status: "processing" | "failed";
  onRetake: () => void;
  onContinueWithoutTags: () => void;
}

export function OcrStep({ status, onRetake, onContinueWithoutTags }: OcrStepProps) {
  if (status === "processing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-line border-t-primary" />
        <p className="font-body text-sm text-ink">{MESSAGES.registration.ocrProcessingTitle}</p>
        <p className="font-body text-xs text-ink-soft">{MESSAGES.registration.ocrProcessingHint}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6L18 18M18 6L6 18" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-body text-sm text-ink">{MESSAGES.registration.ocrFailedTitle}</p>
      <p className="font-body text-xs text-ink-soft">{MESSAGES.registration.ocrFailedHint}</p>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-2xl border-[1.5px] border-line py-3 font-body text-sm font-bold text-ink"
        >
          {MESSAGES.registration.retakePhoto}
        </button>
        <button
          type="button"
          onClick={onContinueWithoutTags}
          className="py-2 font-body text-xs font-bold text-ink-soft underline"
        >
          {MESSAGES.registration.continueWithoutTags}
        </button>
      </div>
    </div>
  );
}

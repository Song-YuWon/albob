"use client";

import { TagChip } from "./TagChip";
import { MESSAGES } from "@/lib/constants/messages";
import type { WizardTag } from "./types";

interface TagsStepProps {
  tags: WizardTag[];
  onTagClick: (tagKey: string) => void;
  onAddTag: () => void;
  onNext: () => void;
}

export function TagsStep({ tags, onTagClick, onAddTag, onNext }: TagsStepProps) {
  const unresolvedCount = tags.filter((tag) => tag.status === "unresolved").length;
  const canProceed = unresolvedCount === 0;

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-4">
      <div
        className={`rounded-xl px-4 py-3 text-center font-body text-xs ${
          canProceed ? "bg-primary-soft text-ink" : "bg-surface-2 text-ink-soft"
        }`}
      >
        {canProceed
          ? MESSAGES.registration.tagsAllResolved
          : `${MESSAGES.registration.tagsUnresolvedBanner} (${unresolvedCount}개)`}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagChip key={tag.key} tag={tag} onClick={() => onTagClick(tag.key)} />
        ))}
        <button
          type="button"
          onClick={onAddTag}
          className="rounded-full border border-dashed border-ink-soft px-3 py-1.5 font-body text-xs text-ink-soft"
        >
          {MESSAGES.registration.addTag}
        </button>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full rounded-2xl py-4 font-body text-sm font-bold text-white transition ${
          canProceed ? "bg-primary shadow-[0_10px_24px_-10px_var(--accent)]" : "bg-surface-2 text-ink-soft shadow-none"
        }`}
      >
        {MESSAGES.registration.nextStep}
      </button>
    </div>
  );
}

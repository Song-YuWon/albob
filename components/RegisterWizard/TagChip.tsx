import type { WizardTag } from "./types";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13L10 18L19 7"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="var(--accent)" strokeWidth="2" />
      <path d="M12 8V12L15 14" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface TagChipProps {
  tag: WizardTag;
  onClick: () => void;
}

// 태그 3상태 스타일 (기획서 v1.6, 디자인 핸드오프 ③ 단계 명세)
export function TagChip({ tag, onClick }: TagChipProps) {
  const label = tag.ingredientName ?? tag.rawText;
  const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-xs";

  if (tag.status === "matched") {
    return (
      <button type="button" onClick={onClick} className={`${base} border border-primary bg-primary-soft text-ink`}>
        <CheckIcon />
        {label}
      </button>
    );
  }

  if (tag.status === "requested") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} border border-dashed border-primary bg-surface text-ink`}
      >
        <ClockIcon />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} border border-dashed border-ink-soft bg-surface-2 text-ink shadow-[0_0_0_3px_var(--accent-soft)]`}
    >
      {label} ?
    </button>
  );
}

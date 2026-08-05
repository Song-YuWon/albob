import type { WizardStep } from "./types";

const STEP_TO_DOT: Record<WizardStep, number> = {
  "photo-front": 1,
  "photo-back": 1,
  ocr: 2,
  tags: 3,
  info: 4,
  done: 5,
};

export function ProgressDots({ step }: { step: WizardStep }) {
  const current = STEP_TO_DOT[step];

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span key={dot} className={`h-2 w-2 rounded-full ${dot === current ? "bg-primary" : "bg-line"}`} />
      ))}
    </div>
  );
}

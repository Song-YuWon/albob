import { MESSAGES } from "@/lib/constants/messages";

interface InfoStepProps {
  name: string;
  brand: string;
  onNameChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  frontPhotoUrl: string | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
}

export function InfoStep({
  name,
  brand,
  onNameChange,
  onBrandChange,
  frontPhotoUrl,
  isSubmitting,
  errorMessage,
  onSubmit,
}: InfoStepProps) {
  const canSubmit = name.trim().length > 0 && brand.trim().length > 0 && !isSubmitting;

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-4">
      <input
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder={MESSAGES.registration.productNamePlaceholder}
        className="w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-4 font-body text-sm text-ink focus:outline-none"
      />
      <input
        value={brand}
        onChange={(event) => onBrandChange(event.target.value)}
        placeholder={MESSAGES.registration.brandPlaceholder}
        className="w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-4 font-body text-sm text-ink focus:outline-none"
      />

      {frontPhotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frontPhotoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
      )}

      <div className="rounded-xl bg-surface-2 px-4 py-3 text-center font-body text-xs text-ink-soft">
        {MESSAGES.registration.sharedDataNotice}
      </div>

      {errorMessage && <p className="text-center font-body text-[11.5px] text-danger">{errorMessage}</p>}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`w-full rounded-2xl py-4 font-body text-sm font-bold text-white transition ${
          canSubmit ? "bg-primary shadow-[0_10px_24px_-10px_var(--accent)]" : "bg-surface-2 text-ink-soft shadow-none"
        }`}
      >
        {isSubmitting ? MESSAGES.registration.submitting : MESSAGES.registration.submitButton}
      </button>
    </div>
  );
}

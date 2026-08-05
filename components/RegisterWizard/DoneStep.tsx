import Link from "next/link";
import { MESSAGES } from "@/lib/constants/messages";

interface DoneStepProps {
  productId: string;
  testerId: string;
}

export function DoneStep({ productId, testerId }: DoneStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border border-primary bg-primary-soft">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 13L10 18L19 7"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-display text-lg text-ink">{MESSAGES.registration.doneTitle}</p>
      <p className="font-body text-sm text-ink-soft">{MESSAGES.registration.firstRegistrant(testerId)}</p>

      <Link
        href={`/products/${productId}`}
        className="mt-4 w-full max-w-xs rounded-2xl bg-primary py-4 text-center font-body text-sm font-bold text-white shadow-[0_10px_24px_-10px_var(--accent)]"
      >
        {MESSAGES.registration.viewDetail}
      </Link>
    </div>
  );
}

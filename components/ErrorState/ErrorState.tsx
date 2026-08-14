import { MESSAGES } from "@/lib/constants/messages";

interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  hint?: string;
}

// 디자인 핸드오프 "화면 8: 네트워크/서버 에러(공통, Global error state)" 스펙 —
// 풀스크린(에러 바운더리)과 오버레이(개별 요청 실패) 양쪽에서 재사용한다.
export function ErrorState({ onRetry, title, hint }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="var(--danger)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 9V13" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M12 16.5V16.51" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-body text-sm text-ink">{title ?? MESSAGES.error.title}</p>
      <p className="font-body text-xs text-ink-soft">{hint ?? MESSAGES.error.hint}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-2xl border-[1.5px] border-primary px-6 py-3 font-body text-sm font-bold text-primary"
      >
        {MESSAGES.error.retryButton}
      </button>
    </div>
  );
}

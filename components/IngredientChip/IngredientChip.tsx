import { MESSAGES } from "@/lib/constants/messages";

interface IngredientChipProps {
  name: string;
  status: "approved" | "pending";
}

// 제품 상세/수정 화면에서 이미 확정된 성분을 보여주는 칩 — 등록 위저드의 3상태 TagChip과 달리
// 여기선 승인 여부(approved/pending)만 구분하면 된다.
export function IngredientChip({ name, status }: IngredientChipProps) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary bg-surface px-3 py-1.5 font-body text-xs text-ink">
        {name}
        <span className="font-body text-[10px] text-primary">{MESSAGES.tagSearch.pendingBadge}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-primary bg-primary-soft px-3 py-1.5 font-body text-xs text-ink">
      {name}
    </span>
  );
}

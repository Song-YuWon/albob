"use client";

import { useEffect, useState } from "react";
import {
  searchIngredientsApi,
  requestIngredientApi,
  type IngredientSearchResultItem,
} from "@/lib/client/registrationApi";
import { ErrorState } from "@/components/ErrorState/ErrorState";
import { MESSAGES } from "@/lib/constants/messages";
import { useDismissOnBackNavigation } from "./useDismissOnBackNavigation";
import { useSheetDragDismiss } from "./useSheetDragDismiss";

interface TagSearchSheetProps {
  initialQuery: string;
  onSelect: (ingredient: { id: string; name: string }) => void;
  onRequestNew: (ingredient: { id: string; name: string }) => void;
  onClose: () => void;
  // 기존 태그를 편집하는 경우에만 넘어온다 — 새 태그 추가일 땐 지울 대상 자체가 없다
  onDelete?: () => void;
}

export function TagSearchSheet({ initialQuery, onSelect, onRequestNew, onClose, onDelete }: TagSearchSheetProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<IngredientSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useDismissOnBackNavigation(onClose);
  const { dragY, handleDragStart, handleDragMove, handleDragEnd } = useSheetDragDismiss(onClose);

  const trimmedQuery = query.trim();
  // 부분/유사 일치 검색이라 결과가 있어도 사용자가 찾는 정확한 성분이 없을 수 있다 —
  // 그럴 때도 추가 요청을 할 수 있어야 한다 (결과가 0건일 때만 요청 버튼을 보여주면
  // "쌀 단백질" 검색 시 "쌀", "단세포단백질"만 나오고 요청할 방법이 없어지는 문제가 생김).
  const hasExactMatch = results.some((item) => item.name.toLowerCase() === trimmedQuery.toLowerCase());
  const showRequestButton = !isSearching && !searchError && trimmedQuery.length > 0 && hasSearched && !hasExactMatch;

  // cancelledRef: 입력이 바뀌어 새 디바운스 사이클이 시작되면 이전 요청의 결과가 뒤늦게
  // 와도 화면에 반영하지 않는다. 재시도 버튼은 그 자리에서 바로 실행하는 별도 호출이라
  // 디바운스를 거치지 않는다.
  const runSearch = async (searchQuery: string, cancelledRef: { current: boolean }) => {
    setIsSearching(true);
    setSearchError(false);
    try {
      const items = await searchIngredientsApi(searchQuery);
      if (cancelledRef.current) return;
      setResults(items);
      setHasSearched(true);
    } catch {
      if (!cancelledRef.current) setSearchError(true);
    } finally {
      if (!cancelledRef.current) setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!trimmedQuery) return;

    const cancelledRef = { current: false };
    const timer = setTimeout(() => {
      runSearch(trimmedQuery, cancelledRef);
    }, 300);

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  const handleRetrySearch = () => {
    runSearch(trimmedQuery, { current: false });
  };

  const handleRequestNew = async () => {
    if (!trimmedQuery) return;
    setIsRequesting(true);
    setRequestError(null);
    try {
      const ingredient = await requestIngredientApi(trimmedQuery);
      onRequestNew(ingredient);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : MESSAGES.error.title);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/30" onClick={onClose}>
      <div
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        className="flex h-[100dvh] w-full flex-col rounded-t-[22px] bg-surface transition-transform"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 고정 상단: 드래그 핸들 + 제목 + 검색창 — 검색창 입력 자체를 뺀 영역 전체가
            드래그로 시트를 닫는 제스처를 받는다(핸들만 정확히 잡아야 하는 불편함을 없앰) */}
        <div
          className="shrink-0 touch-none px-6 pt-3"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
          <p className="mb-3 font-body text-sm font-bold text-ink">{MESSAGES.tagSearch.title}</p>

          <input
            type="search"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={MESSAGES.tagSearch.placeholder}
            className="mb-4 w-full touch-auto rounded-2xl border-[1.5px] border-primary bg-surface px-4 py-3 font-body text-sm text-ink focus:outline-none"
          />
        </div>

        {/* 스크롤 영역: 검색 결과만 이 안에서 스크롤되고 시트 자체는 늘어나지 않는다 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {isSearching && <p className="py-4 text-center font-body text-xs text-ink-soft">검색 중...</p>}

          {!isSearching && searchError && <ErrorState onRetry={handleRetrySearch} />}

          {!isSearching && !searchError && trimmedQuery && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="font-body text-sm text-ink">{MESSAGES.tagSearch.noResultsTitle}</p>
              <p className="font-body text-xs text-ink-soft">{MESSAGES.tagSearch.noResultsHint}</p>
            </div>
          )}

          {!isSearching && !searchError && trimmedQuery && results.length > 0 && (
            <ul className="flex flex-col">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex w-full items-center justify-between border-b border-line py-3 text-left"
                  >
                    <span className="font-body text-sm text-ink">{item.name}</span>
                    {item.status === "pending" && (
                      <span className="rounded-full border border-dashed border-primary px-2 py-0.5 font-body text-[10px] text-primary">
                        {MESSAGES.tagSearch.pendingBadge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 고정 하단: 액션 버튼들 */}
        {(showRequestButton || onDelete) && (
          <div className="shrink-0 border-t border-line px-6 pt-3 pb-6">
            {showRequestButton && (
              <>
                <button
                  type="button"
                  onClick={handleRequestNew}
                  disabled={isRequesting}
                  className="w-full rounded-2xl border-[1.5px] border-dashed border-primary px-4 py-3 font-body text-xs font-bold text-primary disabled:opacity-60"
                >
                  {isRequesting ? "요청하는 중..." : MESSAGES.tagSearch.requestButton(trimmedQuery)}
                </button>
                {requestError && (
                  <p className="mt-2 text-center font-body text-[11.5px] text-danger">{requestError}</p>
                )}
              </>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="mt-2 w-full py-2 font-body text-xs text-danger"
              >
                {MESSAGES.tagSearch.deleteButton}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  searchIngredientsApi,
  requestIngredientApi,
  type IngredientSearchResultItem,
} from "@/lib/client/registrationApi";
import { MESSAGES } from "@/lib/constants/messages";

interface TagSearchSheetProps {
  initialQuery: string;
  onSelect: (ingredient: { id: string; name: string }) => void;
  onRequestNew: (ingredient: { id: string; name: string }) => void;
  onClose: () => void;
  // 기존 태그를 편집하는 경우에만 넘어온다 — 새 태그 추가일 땐 지울 대상 자체가 없다
  onDelete?: () => void;
}

// 핸들을 이만큼 아래로 끌면 닫힘으로 처리한다
const DISMISS_DRAG_THRESHOLD_PX = 100;

export function TagSearchSheet({ initialQuery, onSelect, onRequestNew, onClose, onDelete }: TagSearchSheetProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<IngredientSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  // 뒤로가기로 닫힐 때는 popstate가 이미 히스토리를 되돌린 상태라 정리(history.back())가
  // 필요 없다 — 그 외(바깥 클릭, 항목 선택, 드래그 닫기 등)로 닫힐 때만 우리가 쌓아둔
  // 더미 엔트리를 되돌려줘야 뒤로가기를 두 번 눌러야 하는 상황을 막을 수 있다.
  const closedViaPopStateRef = useRef(false);
  // 개발 모드 StrictMode는 effect를 마운트→클린업→재마운트로 두 번 실행한다. 클린업에서
  // 곧바로 history.back()을 부르면 그 결과 popstate가 비동기로 발생해 재마운트 시점의
  // 리스너를 오작동시켜 시트가 열리자마자 닫혀버린다. 그래서 클린업은 history.back()을
  // 다음 틱으로 미뤄두고, 재마운트가 그 예약을 취소하는 방식으로 "진짜 언마운트"만 반영한다.
  const pendingHistoryBackRef = useRef<number | null>(null);

  const trimmedQuery = query.trim();
  // 부분/유사 일치 검색이라 결과가 있어도 사용자가 찾는 정확한 성분이 없을 수 있다 —
  // 그럴 때도 추가 요청을 할 수 있어야 한다 (결과가 0건일 때만 요청 버튼을 보여주면
  // "쌀 단백질" 검색 시 "쌀", "단세포단백질"만 나오고 요청할 방법이 없어지는 문제가 생김).
  const hasExactMatch = results.some((item) => item.name.toLowerCase() === trimmedQuery.toLowerCase());
  const showRequestButton = !isSearching && trimmedQuery.length > 0 && hasSearched && !hasExactMatch;

  // 안드로이드 뒤로가기(제스처/버튼)를 누르면 이전 화면으로 가지 않고 시트만 닫히게 —
  // 시트가 열릴 때 더미 히스토리를 하나 쌓아두고, 그걸 pop하는 뒤로가기를 가로채서 닫기만 한다.
  useEffect(() => {
    if (pendingHistoryBackRef.current !== null) {
      window.clearTimeout(pendingHistoryBackRef.current);
      pendingHistoryBackRef.current = null;
    } else {
      window.history.pushState({ tagSearchSheet: true }, "");
    }

    const handlePopState = () => {
      closedViaPopStateRef.current = true;
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!closedViaPopStateRef.current) {
        pendingHistoryBackRef.current = window.setTimeout(() => {
          pendingHistoryBackRef.current = null;
          window.history.back();
        }, 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!trimmedQuery) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      searchIngredientsApi(trimmedQuery)
        .then((items) => {
          if (cancelled) return;
          setResults(items);
          setHasSearched(true);
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  const handleRequestNew = async () => {
    if (!trimmedQuery) return;
    setIsRequesting(true);
    try {
      const ingredient = await requestIngredientApi(trimmedQuery);
      onRequestNew(ingredient);
    } finally {
      setIsRequesting(false);
    }
  };

  // 아래로 끌어서 닫는 제스처 — 상단 고정 영역(핸들+제목+검색창 주변) 전체에서 동작한다.
  // 검색창 입력 자체는 텍스트 커서 조작과 충돌하니 그 위에서 시작한 터치는 드래그로 취급하지 않는다.
  // 터치 전용 Touch Events 대신 마우스에서도 동일하게 동작하는 Pointer Events를 쓴다.
  const handleDragStart = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest("input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartYRef.current = event.clientY;
  };
  const handleDragMove = (event: PointerEvent) => {
    if (dragStartYRef.current === null) return;
    const delta = event.clientY - dragStartYRef.current;
    if (delta > 0) setDragY(delta);
  };
  const handleDragEnd = () => {
    if (dragStartYRef.current === null) return;
    if (dragY > DISMISS_DRAG_THRESHOLD_PX) {
      onClose();
      return;
    }
    setDragY(0);
    dragStartYRef.current = null;
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

          {!isSearching && trimmedQuery && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="font-body text-sm text-ink">{MESSAGES.tagSearch.noResultsTitle}</p>
              <p className="font-body text-xs text-ink-soft">{MESSAGES.tagSearch.noResultsHint}</p>
            </div>
          )}

          {!isSearching && trimmedQuery && results.length > 0 && (
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
              <button
                type="button"
                onClick={handleRequestNew}
                disabled={isRequesting}
                className="w-full rounded-2xl border-[1.5px] border-dashed border-primary px-4 py-3 font-body text-xs font-bold text-primary disabled:opacity-60"
              >
                {isRequesting ? "요청하는 중..." : MESSAGES.tagSearch.requestButton(trimmedQuery)}
              </button>
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

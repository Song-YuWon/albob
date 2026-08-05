"use client";

import { useEffect, useState } from "react";
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
}

export function TagSearchSheet({ initialQuery, onSelect, onRequestNew, onClose }: TagSearchSheetProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<IngredientSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const trimmedQuery = query.trim();

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

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/30" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full overflow-y-auto rounded-t-[22px] bg-surface px-6 pb-8 pt-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <p className="mb-3 font-body text-sm font-bold text-ink">{MESSAGES.tagSearch.title}</p>

        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={MESSAGES.tagSearch.placeholder}
          className="mb-4 w-full rounded-2xl border-[1.5px] border-primary bg-surface px-4 py-3 font-body text-sm text-ink focus:outline-none"
        />

        {isSearching && <p className="py-4 text-center font-body text-xs text-ink-soft">검색 중...</p>}

        {!isSearching && trimmedQuery && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-body text-sm text-ink">{MESSAGES.tagSearch.noResultsTitle}</p>
            <p className="font-body text-xs text-ink-soft">{MESSAGES.tagSearch.noResultsHint}</p>
            <button
              type="button"
              onClick={handleRequestNew}
              disabled={isRequesting}
              className="mt-1 rounded-2xl border-[1.5px] border-primary px-4 py-3 font-body text-sm font-bold text-primary disabled:opacity-60"
            >
              {isRequesting ? "요청하는 중..." : MESSAGES.tagSearch.requestButton(trimmedQuery)}
            </button>
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
    </div>
  );
}

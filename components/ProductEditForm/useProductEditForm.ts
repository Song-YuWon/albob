"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/client/fetchJson";
import { MESSAGES } from "@/lib/constants/messages";
import type { ProductDetail } from "@/lib/db/products";
import type { WizardTag } from "@/components/RegisterWizard/types";

interface SearchTarget {
  tagKey: string | null; // null = 새 태그 추가, 값 있으면 해당 태그 교체
  initialQuery: string;
}

// 기존 성분(approved/pending)을 등록 위저드와 같은 3상태 칩 모양으로 맞춰서
// TagChip/TagSearchSheet를 그대로 재사용한다 — approved는 matched로, pending은 requested로 취급.
function toEditableTags(ingredients: ProductDetail["ingredients"]): WizardTag[] {
  return ingredients.map((ingredient) => ({
    key: ingredient.id,
    rawText: ingredient.name,
    status: ingredient.status === "pending" ? "requested" : "matched",
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
  }));
}

export function useProductEditForm(product: ProductDetail) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand);
  const [tags, setTags] = useState<WizardTag[]>(() => toEditableTags(product.ingredients));
  const [searchTarget, setSearchTarget] = useState<SearchTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTagClick = (tagKey: string) => {
    const tag = tags.find((t) => t.key === tagKey);
    // 한 번이라도 성분이 확정됐으면 그 이름을 채워야 한다 — rawText는 원문 그대로라
    // 수정 후 다시 열면 예전 값이 나타나는 문제가 있었다 (TagChip 라벨 표시와 같은 우선순위)
    setSearchTarget({ tagKey, initialQuery: tag?.ingredientName ?? tag?.rawText ?? "" });
  };

  const handleAddTag = () => setSearchTarget({ tagKey: null, initialQuery: "" });

  const handleDeleteTag = () => {
    if (!searchTarget?.tagKey) return;
    setTags((prev) => prev.filter((tag) => tag.key !== searchTarget.tagKey));
    setSearchTarget(null);
  };

  const applyTagResult = (ingredient: { id: string; name: string }, status: "matched" | "requested") => {
    setTags((prev) => {
      if (searchTarget?.tagKey) {
        return prev.map((tag) =>
          tag.key === searchTarget.tagKey
            ? { ...tag, status, ingredientId: ingredient.id, ingredientName: ingredient.name }
            : tag,
        );
      }
      return [
        ...prev,
        { key: ingredient.id, rawText: ingredient.name, status, ingredientId: ingredient.id, ingredientName: ingredient.name },
      ];
    });
    setSearchTarget(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await fetchJson(
        `/api/products/${product.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            brand,
            ingredientIds: tags.map((tag) => tag.ingredientId).filter((id): id is string => Boolean(id)),
          }),
        },
        MESSAGES.productEdit.submitFailed,
      );
      router.push(`/products/${product.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : MESSAGES.productEdit.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    brand,
    setBrand,
    tags,
    searchTarget,
    setSearchTarget,
    isSubmitting,
    error,
    handleTagClick,
    handleAddTag,
    handleDeleteTag,
    applyTagResult,
    handleSubmit,
  };
}

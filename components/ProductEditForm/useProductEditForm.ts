"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    setSearchTarget({ tagKey, initialQuery: tag?.rawText ?? "" });
  };

  const handleAddTag = () => setSearchTarget({ tagKey: null, initialQuery: "" });

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
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand,
          ingredientIds: tags.map((tag) => tag.ingredientId).filter((id): id is string => Boolean(id)),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? "수정에 실패했어요");
      }
      router.push(`/products/${product.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했어요");
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
    applyTagResult,
    handleSubmit,
  };
}

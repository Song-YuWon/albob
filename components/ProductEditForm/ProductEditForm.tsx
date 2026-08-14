"use client";

import { TagChip } from "@/components/RegisterWizard/TagChip";
import { TagSearchSheet } from "@/components/RegisterWizard/TagSearchSheet";
import { MESSAGES } from "@/lib/constants/messages";
import { formatKoreanDate } from "@/lib/utils/formatDate";
import type { ProductDetail } from "@/lib/db/products";
import { useProductEditForm } from "./useProductEditForm";

interface ProductEditFormProps {
  product: ProductDetail;
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const form = useProductEditForm(product);
  const canSubmit = !form.isSubmitting && form.name.trim().length > 0 && form.brand.trim().length > 0;

  return (
    <div className="flex min-h-full flex-1 flex-col gap-4 bg-bg px-6 pt-6 pb-8">
      <div className="rounded-xl bg-surface-2 px-4 py-3 text-center font-body text-xs text-ink-soft">
        {MESSAGES.productEdit.sharedDataNotice}
      </div>

      <input
        autoComplete="off"
        value={form.name}
        onChange={(event) => form.setName(event.target.value)}
        placeholder={MESSAGES.registration.productNamePlaceholder}
        className="w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-4 font-body text-sm text-ink focus:outline-none"
      />
      <input
        autoComplete="off"
        value={form.brand}
        onChange={(event) => form.setBrand(event.target.value)}
        placeholder={MESSAGES.registration.brandPlaceholder}
        className="w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-4 font-body text-sm text-ink focus:outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {form.tags.map((tag) => (
          <TagChip key={tag.key} tag={tag} onClick={() => form.handleTagClick(tag.key)} />
        ))}
        <button
          type="button"
          onClick={form.handleAddTag}
          className="rounded-full border border-dashed border-ink-soft px-3 py-1.5 font-body text-xs text-ink-soft"
        >
          {MESSAGES.registration.addTag}
        </button>
      </div>

      <p className="font-body text-[10.5px] text-ink-soft">
        {MESSAGES.productEdit.lastEdited(formatKoreanDate(product.updatedAt), product.updatedBy)}
      </p>

      {form.error && <p className="text-center font-body text-[11.5px] text-danger">{form.error}</p>}

      <div className="flex-1" />

      <button
        type="button"
        onClick={form.handleSubmit}
        disabled={!canSubmit}
        className={`w-full rounded-2xl py-4 font-body text-sm font-bold text-white transition ${
          canSubmit ? "bg-primary shadow-[0_10px_24px_-10px_var(--accent)]" : "bg-surface-2 text-ink-soft shadow-none"
        }`}
      >
        {form.isSubmitting ? MESSAGES.productEdit.submitting : MESSAGES.productEdit.submitButton}
      </button>

      {form.searchTarget && (
        <TagSearchSheet
          initialQuery={form.searchTarget.initialQuery}
          onSelect={(ingredient) => form.applyTagResult(ingredient, "matched")}
          onRequestNew={(ingredient) => form.applyTagResult(ingredient, "requested")}
          onClose={() => form.setSearchTarget(null)}
          onDelete={form.searchTarget.tagKey ? form.handleDeleteTag : undefined}
        />
      )}
    </div>
  );
}

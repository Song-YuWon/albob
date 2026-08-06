"use client";

import { StarRating } from "@/components/StarRating/StarRating";
import { formatKoreanDate } from "@/lib/utils/formatDate";
import { MESSAGES } from "@/lib/constants/messages";
import type { Review } from "@/lib/db/reviews";
import { useReviewForm } from "./useReviewForm";

interface ReviewFormProps {
  productId: string;
  productName: string;
  testerId: string;
  initialReview: Review | null;
}

export function ReviewForm({ productId, productName, testerId, initialReview }: ReviewFormProps) {
  const form = useReviewForm(productId, testerId, initialReview);
  const canSubmit = form.rating > 0 && form.comment.trim().length > 0 && !form.isSubmitting;

  return (
    <div className="flex min-h-full flex-1 flex-col gap-5 bg-bg px-6 pt-6 pb-8">
      <div>
        <h1 className="font-display text-lg font-bold text-ink">
          {form.review ? MESSAGES.reviewForm.editTitle : MESSAGES.reviewForm.writeTitle}
        </h1>
        <p className="mt-1 font-body text-sm text-ink-soft">{productName}</p>
      </div>

      {form.isEditing ? (
        <>
          <StarRating rating={form.rating} onSelect={form.handleSelectRating} className="text-[26px]" />
          {form.ratingError && (
            <p className="font-body text-[11.5px] text-danger">{MESSAGES.review.ratingRequired}</p>
          )}

          <textarea
            value={form.comment}
            onChange={(event) => form.setComment(event.target.value)}
            placeholder={MESSAGES.reviewForm.commentPlaceholder}
            rows={5}
            className="w-full resize-none rounded-2xl border-[1.5px] border-line bg-surface px-4 py-4 font-body text-sm text-ink focus:outline-none"
          />

          {form.submitError && <p className="font-body text-[11.5px] text-danger">{form.submitError}</p>}

          <div className="flex gap-3">
            {form.review && (
              <button
                type="button"
                onClick={form.cancelEdit}
                className="flex-1 rounded-2xl border-[1.5px] border-line py-4 font-body text-sm font-bold text-ink"
              >
                {MESSAGES.reviewForm.cancelButton}
              </button>
            )}
            <button
              type="button"
              onClick={form.handleSubmit}
              className={`flex-1 rounded-2xl py-4 font-body text-sm font-bold text-white transition ${
                canSubmit ? "bg-primary shadow-[0_10px_24px_-10px_var(--accent)]" : "bg-primary/50 shadow-none"
              }`}
            >
              {form.isSubmitting
                ? form.review
                  ? MESSAGES.reviewForm.updating
                  : MESSAGES.reviewForm.submitting
                : form.review
                  ? MESSAGES.reviewForm.updateButton
                  : MESSAGES.reviewForm.submitButton}
            </button>
          </div>
        </>
      ) : (
        form.review && (
          <div className="flex flex-col gap-3">
            <div className="h-px bg-line" />
            <p className="font-body text-[11px] font-bold tracking-wide text-ink-soft uppercase">
              {MESSAGES.reviewForm.myReviewLabel}
            </p>

            <div className="rounded-2xl border-[1.5px] border-line bg-surface p-4">
              <StarRating rating={form.review.rating} className="text-sm" />
              <p className="mt-2 font-body text-sm leading-relaxed text-ink">{form.review.comment}</p>
              <p className="mt-2 font-body text-[10.5px] text-ink-soft">
                {formatKoreanDate(form.review.updatedAt)}
              </p>
            </div>

            <p className="font-body text-[10.5px] text-ink-soft">{MESSAGES.reviewForm.ownerOnlyCaption}</p>

            {form.deleteError && <p className="font-body text-[11.5px] text-danger">{form.deleteError}</p>}

            {form.isConfirmingDelete ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => form.setIsConfirmingDelete(false)}
                  className="flex-1 rounded-2xl border-[1.5px] border-line py-3 font-body text-sm font-bold text-ink"
                >
                  {MESSAGES.reviewForm.cancelButton}
                </button>
                <button
                  type="button"
                  onClick={form.handleDelete}
                  disabled={form.isDeleting}
                  className="flex-1 rounded-2xl bg-danger py-3 font-body text-sm font-bold text-white"
                >
                  {MESSAGES.reviewForm.deleteConfirmButton}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={form.startEdit}
                  className="flex-1 rounded-2xl border-[1.5px] border-primary py-3 font-body text-sm font-bold text-primary"
                >
                  {MESSAGES.reviewForm.editAction}
                </button>
                <button
                  type="button"
                  onClick={() => form.setIsConfirmingDelete(true)}
                  className="flex-1 rounded-2xl border-[1.5px] border-line py-3 font-body text-sm font-bold text-ink-soft"
                >
                  {MESSAGES.reviewForm.deleteAction}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

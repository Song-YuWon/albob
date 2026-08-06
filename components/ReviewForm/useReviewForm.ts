"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MESSAGES } from "@/lib/constants/messages";
import type { Review } from "@/lib/db/reviews";

async function parseJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? fallbackMessage);
  }
  return body as T;
}

export function useReviewForm(productId: string, testerId: string, initialReview: Review | null) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  // 리뷰가 없으면 처음부터 작성 폼을 보여주고, 있으면 "내 리뷰" 보기부터 시작한다
  const [isEditing, setIsEditing] = useState(initialReview === null);
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [ratingError, setRatingError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const startEdit = () => {
    setRating(review?.rating ?? 0);
    setComment(review?.comment ?? "");
    setRatingError(false);
    setSubmitError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!review) return; // 아직 리뷰가 없으면 취소할 "이전 상태"가 없다
    setIsEditing(false);
    setSubmitError(null);
  };

  const handleSelectRating = (value: number) => {
    setRating(value);
    setRatingError(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    if (comment.trim().length === 0) {
      setSubmitError(MESSAGES.review.commentRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = review
        ? await fetch(`/api/reviews/${review.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, comment }),
          })
        : await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, rating, comment }),
          });

      if (review) {
        await parseJsonOrThrow(response, MESSAGES.reviewForm.submitting);
        setReview({ ...review, rating, comment });
      } else {
        const body = await parseJsonOrThrow<{ reviewId: string }>(response, MESSAGES.reviewForm.submitting);
        setReview({
          id: body.reviewId,
          productId,
          userId: testerId,
          rating,
          comment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : MESSAGES.reviewForm.submitting);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
      await parseJsonOrThrow(response, MESSAGES.reviewForm.deleteFailed);
      setReview(null);
      setRating(0);
      setComment("");
      setIsEditing(true);
      setIsConfirmingDelete(false);
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : MESSAGES.reviewForm.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    review,
    isEditing,
    rating,
    comment,
    setComment,
    ratingError,
    isSubmitting,
    submitError,
    isConfirmingDelete,
    setIsConfirmingDelete,
    isDeleting,
    deleteError,
    startEdit,
    cancelEdit,
    handleSelectRating,
    handleSubmit,
    handleDelete,
  };
}

import { z } from "zod";
import { REVIEW_RATING_MIN, REVIEW_RATING_MAX, REVIEW_COMMENT_MAX_LENGTH } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

// 작성/수정 둘 다 별점·코멘트는 공통이라 base로 뽑아서 재사용한다
const reviewCoreSchema = z.object({
  rating: z
    .number({ error: MESSAGES.review.ratingRequired })
    .int()
    .min(REVIEW_RATING_MIN, MESSAGES.review.ratingRequired)
    .max(REVIEW_RATING_MAX, MESSAGES.review.ratingRequired),
  comment: z
    .string({ error: MESSAGES.review.commentRequired })
    .trim()
    .min(1, MESSAGES.review.commentRequired)
    .max(REVIEW_COMMENT_MAX_LENGTH, MESSAGES.review.commentTooLong),
});

export const createReviewSchema = reviewCoreSchema.extend({
  productId: z.string({ error: MESSAGES.upload.invalidRequest }).uuid({ error: MESSAGES.upload.invalidRequest }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// 수정은 어떤 리뷰인지가 URL(id)로 정해지므로 productId가 필요 없다
export const updateReviewSchema = reviewCoreSchema;

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

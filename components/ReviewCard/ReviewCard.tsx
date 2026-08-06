import { StarRating } from "@/components/StarRating/StarRating";
import { formatKoreanDate } from "@/lib/utils/formatDate";
import type { Review } from "@/lib/db/reviews";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-line py-3 last:border-none">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs font-bold text-ink">{review.userId}</p>
        <StarRating rating={review.rating} className="text-sm" />
      </div>
      <p className="mt-1.5 font-body text-sm leading-relaxed text-ink">{review.comment}</p>
      <p className="mt-1.5 font-body text-[10.5px] text-ink-soft">{formatKoreanDate(review.createdAt)}</p>
    </div>
  );
}

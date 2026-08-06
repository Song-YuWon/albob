import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getProductDetail } from "@/lib/db/products";
import { getReviewSummary, listReviews } from "@/lib/db/reviews";
import { BackButton } from "@/components/BackButton/BackButton";
import { ReviewCard } from "@/components/ReviewCard/ReviewCard";
import { MESSAGES } from "@/lib/constants/messages";

interface ReviewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const testerId = await getCurrentTesterId();
  if (!testerId) redirect("/login");

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const product = await getProductDetail(supabase, id);
  if (!product) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-2 bg-bg px-6 text-center">
        <p className="font-display text-lg text-ink">{MESSAGES.productDetail.notFoundTitle}</p>
        <Link href="/" className="font-body text-sm font-bold text-primary">
          홈으로
        </Link>
      </div>
    );
  }

  const [reviewSummary, reviews] = await Promise.all([
    getReviewSummary(supabase, id),
    listReviews(supabase, id),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg px-6 pb-8 pt-6">
      <header className="flex items-center">
        <BackButton />
      </header>

      <div className="mt-4">
        <h1 className="font-display text-lg font-bold text-ink">{MESSAGES.reviewsPage.title(reviewSummary.count)}</h1>
        <p className="mt-1 font-body text-sm text-ink-soft">
          ★ {reviewSummary.averageRating.toFixed(1)} · {product.name}
        </p>
      </div>

      <div className="mt-4 flex flex-col">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

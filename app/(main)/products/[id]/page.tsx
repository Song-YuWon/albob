import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getProductDetail, incrementProductViewCount } from "@/lib/db/products";
import { getReviewSummary, listReviews } from "@/lib/db/reviews";
import { IngredientChip } from "@/components/IngredientChip/IngredientChip";
import { PhotoCarousel } from "@/components/PhotoCarousel/PhotoCarousel";
import { BackButton } from "@/components/BackButton/BackButton";
import { ReviewCard } from "@/components/ReviewCard/ReviewCard";
import { MESSAGES } from "@/lib/constants/messages";
import { formatKoreanDate } from "@/lib/utils/formatDate";

const REVIEW_PREVIEW_COUNT = 2;

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const testerId = await getCurrentTesterId();
  if (!testerId) redirect("/login");

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  // 조회수에 이번 조회가 반영된 상태로 보여주기 위해 증가를 먼저 하고 상세를 가져온다
  await incrementProductViewCount(supabase, id);
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

  const [reviewSummary, reviewPreviews] = await Promise.all([
    getReviewSummary(supabase, id),
    listReviews(supabase, id, REVIEW_PREVIEW_COUNT),
  ]);

  const productPhotos: { src: string; alt: string }[] = [];
  if (product.frontPhotoUrl) {
    productPhotos.push({ src: product.frontPhotoUrl, alt: MESSAGES.productDetail.frontPhotoLabel });
  }
  if (product.backPhotoUrl) {
    productPhotos.push({ src: product.backPhotoUrl, alt: MESSAGES.productDetail.backPhotoLabel });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg pb-36">
      <header className="flex items-center px-6 pt-6">
        <BackButton />
      </header>

      <main className="flex flex-1 flex-col gap-5 px-6 pt-4">
        {productPhotos.length > 0 && <PhotoCarousel photos={productPhotos} className="h-[220px] w-full" />}

        <div>
          <h1 className="font-display text-lg font-bold text-ink">{product.name}</h1>
          <p className="mt-1 font-body text-sm font-bold text-ink-soft">{product.brand}</p>
          <p className="mt-2 font-body text-[10.5px] text-ink-soft">
            {MESSAGES.productDetail.registeredBy(product.createdBy)} ·{" "}
            {MESSAGES.productDetail.lastUpdated(formatKoreanDate(product.updatedAt), product.updatedBy)}
          </p>
          <p className="font-body text-[10.5px] text-ink-soft">
            {MESSAGES.productDetail.viewsAndEdits(product.viewCount, product.editCount)}
          </p>
        </div>

        <section>
          <p className="mb-2 font-body text-[11px] font-bold tracking-wide text-ink-soft uppercase">
            {MESSAGES.productDetail.ingredientsLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.ingredients.length > 0 ? (
              product.ingredients.map((ingredient) => (
                <IngredientChip key={ingredient.id} name={ingredient.name} status={ingredient.status} />
              ))
            ) : (
              <p className="font-body text-xs text-ink-soft">등록된 성분이 없어요</p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-body text-[11px] font-bold tracking-wide text-ink-soft uppercase">
              {MESSAGES.productDetail.reviewsLabel} ({reviewSummary.count})
            </p>
            {reviewSummary.count > 0 && (
              <span className="font-body text-xs font-bold text-primary">
                ★ {reviewSummary.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          {reviewSummary.count === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3L14.6 9L21 9.7L16.2 14.1L17.5 20.4L12 17.1L6.5 20.4L7.8 14.1L3 9.7L9.4 9L12 3Z"
                    stroke="var(--ink-soft)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-body text-xs text-ink-soft">{MESSAGES.productDetail.noReviewsYet}</p>
              <p className="font-display text-sm text-ink">{MESSAGES.productDetail.firstReviewPrompt}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                {reviewPreviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {reviewSummary.count > reviewPreviews.length && (
                <Link
                  href={`/products/${product.id}/reviews`}
                  className="mt-2 block text-center font-body text-xs font-bold text-ink underline"
                >
                  {MESSAGES.productDetail.viewAllReviews}
                </Link>
              )}
            </>
          )}
        </section>

      </main>

      <div className="fixed inset-x-0 bottom-0 flex flex-col gap-1.5 bg-bg px-6 pt-3 pb-4">
        <div className="flex gap-3">
          <Link
            href={`/products/${product.id}/edit`}
            className="flex-1 rounded-2xl border-[1.5px] border-primary py-3.5 text-center font-body text-sm font-bold text-primary"
          >
            {MESSAGES.productDetail.editButton}
          </Link>
          <Link
            href={`/products/${product.id}/review`}
            className="flex-1 rounded-2xl bg-primary py-3.5 text-center font-body text-sm font-bold text-white shadow-[0_10px_24px_-10px_var(--accent)]"
          >
            {MESSAGES.productDetail.writeReviewCta}
          </Link>
        </div>
        <p className="text-center font-body text-[9px] leading-snug text-ink-soft">
          {MESSAGES.productDetail.disclaimer}
        </p>
      </div>
    </div>
  );
}

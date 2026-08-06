import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getProductDetail, incrementProductViewCount } from "@/lib/db/products";
import { IngredientChip } from "@/components/IngredientChip/IngredientChip";
import { PhotoCarousel } from "@/components/PhotoCarousel/PhotoCarousel";
import { BackButton } from "@/components/BackButton/BackButton";
import { MESSAGES } from "@/lib/constants/messages";
import { formatKoreanDate } from "@/lib/utils/formatDate";

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

  const productPhotos: { src: string; alt: string }[] = [];
  if (product.frontPhotoUrl) {
    productPhotos.push({ src: product.frontPhotoUrl, alt: MESSAGES.productDetail.frontPhotoLabel });
  }
  if (product.backPhotoUrl) {
    productPhotos.push({ src: product.backPhotoUrl, alt: MESSAGES.productDetail.backPhotoLabel });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg pb-28">
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
          <p className="mb-2 font-body text-[11px] font-bold tracking-wide text-ink-soft uppercase">
            {MESSAGES.productDetail.reviewsLabel} ({product.reviewCount})
          </p>
          {product.reviewCount === 0 && (
            <p className="font-body text-xs text-ink-soft">{MESSAGES.productDetail.noReviewsYet}</p>
          )}
        </section>

        <p className="pt-2 text-center font-body text-[9.5px] leading-relaxed text-ink-soft">
          {MESSAGES.productDetail.disclaimer}
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-6 py-4">
        <Link
          href={`/products/${product.id}/edit`}
          className="block w-full rounded-2xl border-[1.5px] border-primary py-3.5 text-center font-body text-sm font-bold text-primary"
        >
          {MESSAGES.productDetail.editButton}
        </Link>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getProductDetail } from "@/lib/db/products";
import { getMyReview } from "@/lib/db/reviews";
import { BackButton } from "@/components/BackButton/BackButton";
import { ReviewForm } from "@/components/ReviewForm/ReviewForm";
import { MESSAGES } from "@/lib/constants/messages";

interface ReviewWritePageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewWritePage({ params }: ReviewWritePageProps) {
  const testerId = await getCurrentTesterId();
  if (!testerId) redirect("/login");

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const product = await getProductDetail(supabase, id);
  if (!product) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-2 bg-bg px-6 text-center">
        <p className="font-display text-lg text-ink">{MESSAGES.productDetail.notFoundTitle}</p>
      </div>
    );
  }

  const myReview = await getMyReview(supabase, id, testerId);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <header className="flex items-center px-6 pt-6">
        <BackButton />
      </header>
      <ReviewForm productId={id} productName={product.name} testerId={testerId} initialReview={myReview} />
    </div>
  );
}

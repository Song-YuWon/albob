import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getProductDetail } from "@/lib/db/products";
import { ProductEditForm } from "@/components/ProductEditForm/ProductEditForm";
import { MESSAGES } from "@/lib/constants/messages";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
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

  return <ProductEditForm product={product} />;
}

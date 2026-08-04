import Link from "next/link";
import type { ProductSummary } from "@/lib/db/products";

interface ProductCandidateCardProps {
  product: ProductSummary;
}

export function ProductCandidateCard({ product }: ProductCandidateCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="flex w-[108px] shrink-0 flex-col gap-2">
      <div className="h-[60px] w-full rounded-xl bg-surface-2" />
      <div>
        <p className="truncate font-body text-xs font-bold text-ink">{product.name}</p>
        <p className="truncate font-body text-[10.5px] text-ink-soft">{product.brand}</p>
      </div>
    </Link>
  );
}

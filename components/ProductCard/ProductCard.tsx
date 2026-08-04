import Link from "next/link";
import type { ProductSummary } from "@/lib/db/products";

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex items-center gap-3 border-b border-line py-3 last:border-none"
    >
      <div className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-surface-2" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-[13px] font-bold text-ink">{product.name}</p>
        <p className="mt-0.5 truncate font-body text-[11px] text-ink-soft">
          {product.brand} · 성분 {product.ingredientCount}개
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M9 6L15 12L9 18" stroke="var(--ink-soft)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

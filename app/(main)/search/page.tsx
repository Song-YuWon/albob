import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { searchProductsByKeyword, findSimilarProducts, type ProductSummary } from "@/lib/db/products";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { ProductCandidateCard } from "@/components/ProductCandidateCard/ProductCandidateCard";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const testerId = await getCurrentTesterId();
  if (!testerId) redirect("/login");

  const { q } = await searchParams;
  const keyword = q?.trim() ?? "";
  if (!keyword) redirect("/");

  const supabase = createSupabaseAdminClient();
  const matches = await searchProductsByKeyword(supabase, keyword);
  const candidates = matches.length === 0 ? await findSimilarProducts(supabase, keyword) : [];

  return (
    <div className={`flex min-h-full flex-1 flex-col gap-6 bg-bg px-6 pt-6 ${matches.length > 0 ? "pb-28" : "pb-8"}`}>
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="홈으로">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6L9 12L15 18" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <SearchBar defaultValue={keyword} />
        </div>
      </div>

      {matches.length > 0 ? (
        <>
          <p className="font-body text-sm text-ink">일치하는 사료 {matches.length}건을 찾았어요</p>
          <div className="flex flex-col">
            {matches.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <RegisterInsteadLink keyword={keyword} />
        </>
      ) : (
        <NoMatchState keyword={keyword} candidates={candidates} />
      )}
    </div>
  );
}

function RegisterInsteadLink({ keyword }: { keyword: string }) {
  return (
    <p className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-6 py-4 text-center font-body text-xs text-ink-soft">
      찾는 제품이 아닌가요?{" "}
      <Link href={`/register?name=${encodeURIComponent(keyword)}`} className="font-bold text-ink underline">
        직접 등록하기
      </Link>
    </p>
  );
}

function NoMatchState({ keyword, candidates }: { keyword: string; candidates: ProductSummary[] }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {candidates.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-body text-sm text-ink">혹시 이런 제품을 찾으셨나요?</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {candidates.map((product) => (
              <ProductCandidateCard key={product.id} product={product} />
            ))}
          </div>
          <div className="h-px bg-line" />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-surface-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="6.5" stroke="var(--ink-soft)" strokeWidth="2.2" />
            <path d="M19 19L15 15" stroke="var(--ink-soft)" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M8 8L12 12M12 8L8 12" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-display text-lg text-ink">앗, 아직 없는 사료예요</p>
      </div>

      <Link
        href={`/register?name=${encodeURIComponent(keyword)}`}
        className="block w-full rounded-2xl bg-primary py-4 text-center font-body text-sm font-bold text-white shadow-[0_10px_24px_-10px_var(--accent)]"
      >
        직접 등록해보세요 →
      </Link>
    </div>
  );
}

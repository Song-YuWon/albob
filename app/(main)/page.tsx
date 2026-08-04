import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { Logo } from "@/components/Logo/Logo";
import { ProfileMenu } from "@/components/ProfileMenu/ProfileMenu";
import { SearchBar } from "@/components/SearchBar/SearchBar";

export default async function HomePage() {
  const testerId = await getCurrentTesterId();
  if (!testerId) redirect("/login"); // proxy가 이미 막지만 이중 안전장치

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Logo size="compact" />
          <p className="font-display text-[19px] font-bold text-ink">알밥</p>
        </div>
        <ProfileMenu testerId={testerId} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <p className="font-body text-sm text-ink-soft">{testerId}님, 안녕하세요</p>

        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <p className="font-display text-lg leading-relaxed text-ink">
            우리 아이 사료,
            <br />
            성분이 궁금하다면
          </p>
          <SearchBar />
        </div>
      </main>

      <div className="px-6 pb-8 pt-4">
        <Link
          href="/register"
          className="block w-full rounded-2xl border-[1.5px] border-primary py-4 text-center font-body text-sm font-bold text-primary"
        >
          + 사료 성분표 등록하기
        </Link>
      </div>
    </div>
  );
}

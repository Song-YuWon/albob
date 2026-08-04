import { Logo } from "@/components/Logo/Logo";
import { LoginForm } from "@/components/LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-9 bg-bg px-6 py-12">
      <div className="flex flex-col items-center gap-1 text-center">
        <Logo size="full" />
        <h1 className="mt-2 font-display text-[26px] font-bold text-ink">알밥</h1>
        <p className="-mt-1 font-body text-[11px] text-ink-soft">알고 먹이는 밥그릇</p>
        <p className="mt-9 font-body text-[13px] leading-relaxed text-ink-soft">
          운영자가 발급한 테스터 계정으로
          <br />
          로그인해주세요
        </p>
      </div>

      <LoginForm />

      <p className="font-body text-[11px] text-ink-soft">비공개 베타 · 회원가입 없이 이용</p>
    </main>
  );
}

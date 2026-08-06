interface SearchBarProps {
  defaultValue?: string;
}

// 서버 컴포넌트로도 동작하는 순수 GET 폼 — 검색은 /search?q=로 페이지 이동만 하면 되므로 클라이언트 JS가 필요 없다
export function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <form
      action="/search"
      method="GET"
      className="flex w-full items-center gap-2 rounded-[18px] border-[1.5px] border-line bg-surface px-4 py-3 shadow-sm"
    >
      <button type="submit" aria-label="검색">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="var(--ink-soft)" strokeWidth="2.2" />
          <path d="M20 20L16.5 16.5" stroke="var(--ink-soft)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="사료 이름이나 브랜드를 검색해보세요"
        className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink-soft focus:outline-none"
      />
    </form>
  );
}

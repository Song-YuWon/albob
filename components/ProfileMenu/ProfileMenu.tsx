"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileMenuProps {
  testerId: string;
}

export function ProfileMenu({ testerId }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="프로필 메뉴"
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-2 font-body text-[11px] font-bold text-ink-soft"
      >
        {testerId.slice(-2).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-[110px] overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2.5 text-left font-body text-xs text-ink"
          >
            계정 정보
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-3 py-2.5 text-left font-body text-xs font-bold text-danger"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

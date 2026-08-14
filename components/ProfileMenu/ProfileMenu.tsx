"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MESSAGES } from "@/lib/constants/messages";

interface ProfileMenuProps {
  testerId: string;
}

export function ProfileMenu({ testerId }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
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
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError(MESSAGES.error.title);
      setIsLoggingOut(false);
    }
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
            disabled={isLoggingOut}
            className="block w-full px-3 py-2.5 text-left font-body text-xs font-bold text-danger disabled:opacity-60"
          >
            {isLoggingOut ? "로그아웃하는 중..." : "로그아웃"}
          </button>
          {logoutError && (
            <p className="px-3 pb-2.5 font-body text-[10.5px] text-danger">{logoutError}</p>
          )}
        </div>
      )}
    </div>
  );
}

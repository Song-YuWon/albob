"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { MESSAGES } from "@/lib/constants/messages";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const fieldMessage = serverError ?? errors.id?.message ?? errors.password?.message;

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setServerError(body?.message ?? MESSAGES.auth.loginFailed);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const inputClass = (hasFieldError: boolean) =>
    `w-full rounded-[14px] border-[1.5px] bg-surface px-4 py-4 text-sm text-ink placeholder:text-ink-soft focus:outline-none ${
      hasFieldError ? "border-danger" : "border-line"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
      <input
        {...register("id")}
        type="text"
        placeholder="테스터 ID"
        autoComplete="username"
        className={inputClass(Boolean(errors.id || serverError))}
      />
      <input
        {...register("password")}
        type="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        className={inputClass(Boolean(errors.password || serverError))}
      />

      {fieldMessage && <p className="text-center text-[11.5px] text-danger">{fieldMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-1 rounded-[14px] bg-primary py-4 text-[15px] font-bold text-white transition disabled:opacity-60 ${
          isSubmitting ? "" : "shadow-[0_10px_24px_-10px_var(--accent)]"
        }`}
      >
        로그인
      </button>
    </form>
  );
}

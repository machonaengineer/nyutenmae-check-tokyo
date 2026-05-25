"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsPending(false);

    if (error) {
      setMessage("ログインできませんでした。メールアドレスとパスワードを確認してください。");
      return;
    }

    router.push("/admin/reports");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-md border border-line bg-surface p-5">
      {message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-semibold text-ink">
        管理者メールアドレス
        <input
          className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        パスワード
        <input
          className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      <button
        className="h-11 rounded-md bg-action px-4 text-sm font-semibold text-white disabled:bg-muted"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "確認中..." : "管理画面にログイン"}
      </button>
    </form>
  );
}

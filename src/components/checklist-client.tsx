"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type ChecklistSection = {
  title: string;
  items: readonly string[];
};

type ChecklistClientProps = {
  storageKey: string;
  sections: readonly ChecklistSection[];
};

export function ChecklistClient({ storageKey, sections }: ChecklistClientProps) {
  const allItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => `${section.title}:${item}`),
      ),
    [sections],
  );
  const [checked, setChecked] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // LocalStorageが使えない環境では、その場のチェックだけを維持します。
    }
  }, [checked, storageKey]);

  const completedCount = checked.length;
  const totalCount = allItems.length;
  const completed = completedCount === totalCount;

  function toggle(key: string) {
    setChecked((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function reset() {
    setChecked([]);
    setMessage("チェックをリセットしました。");
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("URLをコピーしました。同行者に共有できます。");
    } catch {
      setMessage("URLを選択してコピーしてください。");
    }
  }

  return (
    <div className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
      <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-action">
            {completedCount}/{totalCount} 完了
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            スマホでチェックし、必要ならこのページを共有できます。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-paper"
            onClick={copyUrl}
            type="button"
          >
            URL共有
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-paper"
            onClick={reset}
            type="button"
          >
            リセット
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-ink">{section.title}</h2>
            <div className="mt-4 grid gap-3">
              {section.items.map((item) => {
                const key = `${section.title}:${item}`;
                const isChecked = checked.includes(key);

                return (
                  <label
                    className="flex min-h-14 cursor-pointer items-start gap-3 rounded-md border border-line bg-surface px-4 py-3 text-sm leading-6 text-ink transition hover:bg-paper"
                    key={key}
                  >
                    <input
                      checked={isChecked}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#0c7c72]"
                      onChange={() => toggle(key)}
                      type="checkbox"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {completed ? (
        <div className="mt-6 rounded-md border border-amber-200 bg-caution-soft p-4">
          <p className="text-sm font-semibold text-ink">
            チェック完了。会計前後の相談先も確認しておくと、万一の時に動きやすくなります。
          </p>
          <Link
            className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href="/support"
          >
            相談先も確認する
          </Link>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
    </div>
  );
}

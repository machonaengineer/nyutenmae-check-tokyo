"use client";

import { useMemo, useState } from "react";
import { buildShareText } from "@/lib/social";

type SocialShareActionsProps = {
  title: string;
  url: string;
};

function buildShareUrls(title: string, url: string) {
  const text = buildShareText(title);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}

export function SocialShareActions({ title, url }: SocialShareActionsProps) {
  const [message, setMessage] = useState("");
  const shareUrls = useMemo(() => buildShareUrls(title, url), [title, url]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("URLをコピーしました。");
    } catch {
      setMessage("URLを選択してコピーしてください。");
    }
  }

  async function shareNative() {
    if (!navigator.share) {
      await copyUrl();
      return;
    }

    try {
      await navigator.share({
        title,
        text: buildShareText(title),
        url,
      });
      setMessage("共有画面を開きました。");
    } catch {
      setMessage("");
    }
  }

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white transition hover:bg-action-dark"
          onClick={shareNative}
          type="button"
        >
          共有
        </button>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-paper"
          onClick={copyUrl}
          type="button"
        >
          URLコピー
        </button>
        <a
          className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          href={shareUrls.x}
          rel="noreferrer"
          target="_blank"
        >
          X
        </a>
        <a
          className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          href={shareUrls.line}
          rel="noreferrer"
          target="_blank"
        >
          LINE
        </a>
        <a
          className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          href={shareUrls.facebook}
          rel="noreferrer"
          target="_blank"
        >
          Facebook
        </a>
      </div>
      {message ? <p className="mt-3 text-xs text-muted">{message}</p> : null}
    </div>
  );
}

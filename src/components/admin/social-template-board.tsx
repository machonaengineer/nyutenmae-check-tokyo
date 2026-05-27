"use client";

import { useState } from "react";
import type { SocialPostTemplate } from "@/lib/social";

export function SocialTemplateBoard({
  templates,
}: {
  templates: SocialPostTemplate[];
}) {
  const [copiedTitle, setCopiedTitle] = useState("");

  async function copyTemplate(template: SocialPostTemplate) {
    await navigator.clipboard.writeText(`${template.text}\n${template.targetUrl}`);
    setCopiedTitle(template.title);
  }

  return (
    <div className="grid gap-4">
      {templates.map((template) => (
        <article key={template.title} className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">{template.title}</h2>
              <a
                className="mt-2 inline-flex text-sm font-semibold text-action"
                href={template.targetUrl}
                rel="noreferrer"
                target="_blank"
              >
                対象ページを開く
              </a>
            </div>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white transition hover:bg-action-dark"
              onClick={() => copyTemplate(template)}
              type="button"
            >
              文面コピー
            </button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-md border border-line bg-surface p-4 text-sm leading-7 text-ink">
            {template.text}
            {"\n"}
            {template.targetUrl}
          </pre>
          {copiedTitle === template.title ? (
            <p className="mt-3 text-xs text-muted">コピーしました。</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { SocialTemplateBoard } from "@/components/admin/social-template-board";
import { Section, SimpleList } from "@/components/page-blocks";
import { requireAdminUser } from "@/lib/admin/auth";
import {
  buildSocialPostTemplates,
  SOCIAL_OPERATION_PILLARS,
  SOCIAL_WEEKLY_ROUTINE,
} from "@/lib/social";

export const metadata: Metadata = {
  title: "SNS運用",
  description: "SNS投稿用の安全な文面テンプレートを確認する管理画面です。",
};

export const dynamic = "force-dynamic";

const operationRules = [
  "SNSには証拠画像、投稿者メールアドレス、非公開メモを載せない。",
  "特定店舗や個人への断定、攻撃、煽り表現を使わない。",
  "Google口コミ、食べログ、SNS、ニュース本文をそのまま転載しない。",
  "個別報告を紹介する場合は、承認済み公開ページのURLだけを共有する。",
] as const;

export default async function AdminSocialPage() {
  const adminUser = await requireAdminUser();
  const templates = buildSocialPostTemplates();

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="SNS運用"
        description="投稿、情報提供、相談導線を広げるための安全なSNS文面を管理します。自動投稿は行いません。"
      >
        <div className="mb-6">
          <SimpleList items={operationRules} />
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {SOCIAL_OPERATION_PILLARS.map((pillar) => (
            <article key={pillar.title} className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{pillar.goal}</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                {pillar.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-ink">毎日の運用型</h2>
          <SimpleList items={SOCIAL_WEEKLY_ROUTINE} />
        </div>
        <SocialTemplateBoard templates={templates} />
      </Section>
    </AdminShell>
  );
}

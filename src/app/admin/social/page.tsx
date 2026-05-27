import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { SocialTemplateBoard } from "@/components/admin/social-template-board";
import { Section, SimpleList } from "@/components/page-blocks";
import { requireAdminUser } from "@/lib/admin/auth";
import { buildSocialPostTemplates } from "@/lib/social";

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
        <SocialTemplateBoard templates={templates} />
      </Section>
    </AdminShell>
  );
}

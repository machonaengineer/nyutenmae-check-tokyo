import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { InitialDataValidator } from "@/components/admin/initial-data-validator";
import { Section, SimpleList } from "@/components/page-blocks";
import { requireAdminUser } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "初期データ検証",
  description: "初期データCSVを投入前に検証する管理画面です。",
};

export const dynamic = "force-dynamic";

const dataRules = [
  "この画面はCSVの投入前検証と、管理者限定の非公開デフォルト投入を行います。",
  "投入できる行は pending または needs_review、証拠レベル Hidden のみです。",
  "Google口コミ、食べログ、SNS、ニュース本文をそのまま転載しないでください。",
  "公開サマリーには投稿者メールアドレス、証拠画像URL、非公開メモを入れないでください。",
  "approved への変更は、投稿詳細画面で人間が審査してから行ってください。",
] as const;

export default async function AdminDataPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="初期データ検証"
        description="INITIAL_DATA_TEMPLATE.csv の内容を確認し、公開前審査用の非公開投稿として投入します。"
      >
        <div className="mb-6">
          <SimpleList items={dataRules} />
        </div>
        <InitialDataValidator />
      </Section>
    </AdminShell>
  );
}

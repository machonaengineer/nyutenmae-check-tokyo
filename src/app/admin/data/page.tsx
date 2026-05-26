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
  "この画面はCSVの投入前検証だけを行い、DBには保存しません。",
  "初期データは原則 pending / Hidden から審査します。",
  "Google口コミ、食べログ、SNS、ニュース本文をそのまま転載しないでください。",
  "公開サマリーには投稿者メールアドレス、証拠画像URL、非公開メモを入れないでください。",
  "approved にする行は、人間の審査記録と公開判断が必要です。",
] as const;

export default async function AdminDataPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="初期データ検証"
        description="INITIAL_DATA_TEMPLATE.csv の内容を投入前に確認します。検証はブラウザ内で行い、保存はしません。"
      >
        <div className="mb-6">
          <SimpleList items={dataRules} />
        </div>
        <InitialDataValidator />
      </Section>
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { createPageMetadata } from "@/lib/seo";
import { ObjectionForm } from "./objection-form";

type ObjectionPageProps = {
  searchParams: Promise<{
    place_id?: string;
    report_id?: string;
    target_url?: string;
  }>;
};

const reviewFlow = [
  "申立て内容は一般公開せず、管理者が対象ページと照合します。",
  "必要に応じて、対象投稿の一時非公開化、公開サマリーの修正、追加確認、削除判断を行います。",
  "申立て者メールアドレス、補足、確認資料の内容は一般公開しません。",
  "本人確認や追加資料が必要な場合、管理者から連絡することがあります。",
] as const;

const objectionRequiredItems = [
  "対象URL",
  "申立て理由",
  "権利者または関係者であることの確認",
  "訂正希望内容",
  "連絡先",
  "確認資料がある場合の添付",
  "一時非公開を希望する理由",
  "虚偽申立てや嫌がらせではないことの確認",
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "異議申立て・訂正依頼｜入店前チェック東京",
  description:
    "掲載内容に関する異議申立て、訂正依頼、削除依頼の導線です。対象URL、理由、関係者確認、訂正希望内容、連絡先を非公開で受け付けます。",
  path: "/objection",
  imageLabel: "異議申立て・訂正依頼・非公開受付",
});

export default async function ObjectionPage({ searchParams }: ObjectionPageProps) {
  const params = await searchParams;
  const defaultTargetUrl =
    params.target_url ?? (params.place_id ? `/places/${params.place_id}` : "");

  return (
    <>
      <PageHeader
        eyebrow="Objection"
        title="異議申立て"
        description="掲載内容に事実関係の相違、個人情報、権利侵害の懸念がある場合に連絡できる導線です。"
      />

      <Section
        title="申立てフォーム"
        description="対象ページ、確認が必要な箇所、連絡先を入力してください。申立て内容は非公開で保存します。"
      >
        <ObjectionForm
          defaultReportId={params.report_id}
          defaultTargetUrl={defaultTargetUrl}
        />
        <div className="mt-6">
          <PolicyNote>
            申立ては内容の正否を即時に判断するものではありません。対象内容を確認し、表示継続、表現修正、非公開化などを慎重に判断します。
          </PolicyNote>
        </div>
      </Section>

      <Section title="確認フロー">
        <SimpleList items={reviewFlow} />
      </Section>

      <Section
        title="入力前に整理すること"
        description="確認に必要な項目がそろっているほど、対象ページの照合と対応判断がしやすくなります。"
      >
        <SimpleList items={objectionRequiredItems} />
      </Section>
    </>
  );
}

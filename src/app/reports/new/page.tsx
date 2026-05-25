import type { Metadata } from "next";
import { DefinitionList, PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { getMaxUploadMb } from "@/lib/report-form";
import { getReportFormOptions } from "@/lib/report-options";
import { EVIDENCE_LEVELS } from "@/lib/site";
import { ReportForm } from "./report-form";

export const metadata: Metadata = {
  title: "注意報告を送る",
  description: "入店前チェック東京へ注意報告を送るページです。",
};

export default async function NewReportPage() {
  const formOptions = await getReportFormOptions();

  return (
    <>
      <PageHeader
        eyebrow="Report"
        title="注意報告を送る"
        description="投稿は自動公開されません。料金説明、会計内容、明細提示、退店時対応など、入店前の確認に役立つ内容を対象にします。"
      />

      <Section
        title="投稿フォーム"
        description="送信内容は非公開の状態で保存し、管理者確認後に公開可否と表示表現を判断します。"
      >
        <ReportForm
          areas={formOptions.areas}
          maxUploadMb={getMaxUploadMb()}
          riskTags={formOptions.riskTags}
        />

        <div className="mt-6">
          <PolicyNote>
            店員個人名、顔写真、電話番号、SNS IDなど、個人を特定し得る情報は公開対象にしません。証拠画像と投稿者メールアドレスも一般公開しません。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="証拠レベル"
        description="初回投稿は非公開のHiddenとして保存され、管理者が内容と証拠を確認します。"
      >
        <DefinitionList items={EVIDENCE_LEVELS} />
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import type { ReportFormSnapshot } from "@/lib/report-form";
import { DefinitionList, PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { getMaxUploadMb } from "@/lib/report-form";
import { getReportFormOptions } from "@/lib/report-options";
import { createPageMetadata } from "@/lib/seo";
import { EVIDENCE_LEVELS } from "@/lib/site";
import { ReportForm } from "./report-form";

export const metadata: Metadata = createPageMetadata({
  title: "情報提供｜入店前チェック東京",
  description:
    "料金説明、会計内容、明細提示、相談状況に関する情報を非公開で送信できます。証拠画像、連絡先、非公開メモは公開ページに出しません。",
  path: "/reports/new",
  imageLabel: "情報提供・証拠非公開・承認制",
  index: false,
});

type NewReportPageProps = {
  searchParams: Promise<{
    area?: string;
    tag?: string;
  }>;
};

export default async function NewReportPage({ searchParams }: NewReportPageProps) {
  const [{ area, tag }, formOptions] = await Promise.all([
    searchParams,
    getReportFormOptions(),
  ]);
  const defaultValues: ReportFormSnapshot = {};
  const areaSlug = typeof area === "string" ? area : "";
  const tagSlug = typeof tag === "string" ? tag : "";

  if (formOptions.areas.some((option) => option.value === areaSlug)) {
    defaultValues.area_slug = areaSlug;
  }

  if (formOptions.riskTags.some((option) => option.value === tagSlug)) {
    defaultValues.risk_tags = [tagSlug];
  }

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
          defaultValues={defaultValues}
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

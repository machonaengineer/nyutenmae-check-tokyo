import type { Metadata } from "next";
import type { ReportFormSnapshot } from "@/lib/report-form";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { getReportFormOptions } from "@/lib/report-options";
import { createPageMetadata } from "@/lib/seo";
import { QuickReportForm } from "./quick-report-form";

export const metadata: Metadata = createPageMetadata({
  title: "30秒で情報提供｜入店前チェック東京",
  description:
    "場所の手がかり、料金説明、明細の有無、相談状況などを非公開で送信できます。投稿は確認後に公開可否を判断し、連絡先や添付資料は公開しません。",
  path: "/reports/quick",
  imageLabel: "情報提供・非公開受付・確認後掲載",
  index: false,
});

type QuickReportPageProps = {
  searchParams: Promise<{
    area?: string;
  }>;
};

const quickRules = [
  "送信内容は自動公開されません。",
  "管理者が表現、個人情報、公開可否を確認します。",
  "証拠画像や投稿者メールアドレスは一般公開しません。",
  "画像や詳細な時系列がある場合は、詳細フォームから送信してください。",
] as const;

const quickSignalItems = [
  "店名が曖昧な場合は、住所、建物名、階数、入口表示",
  "入店前に説明された料金と、会計時に確認した金額",
  "明細、領収書、カード利用控え、相談済み窓口の有無",
] as const;

export default async function QuickReportPage({
  searchParams,
}: QuickReportPageProps) {
  const [{ area }, formOptions] = await Promise.all([
    searchParams,
    getReportFormOptions(),
  ]);
  const defaultValues: ReportFormSnapshot = {};
  const areaSlug = typeof area === "string" ? area : "";

  if (formOptions.areas.some((option) => option.value === areaSlug)) {
    defaultValues.area_slug = areaSlug;
  }

  return (
    <>
      <PageHeader
        eyebrow="Quick Report"
        title="30秒で情報提供"
        description="店名が曖昧でも、住所、建物名、階数、料金説明、明細提示の手がかりを非公開で送れます。"
      />

      <Section
        title="店名がわからなくても送れる情報"
        description="公開情報を増やすため、店舗名だけでなく、場所と説明内容の手がかりを重視しています。"
      >
        <SimpleList items={quickSignalItems} />
      </Section>

      <Section title="簡易投稿フォーム">
        <QuickReportForm
          areas={formOptions.areas}
          defaultValues={defaultValues}
          riskTags={formOptions.riskTags}
        />
        <div className="mt-6">
          <PolicyNote>
            簡易投稿も `pending / Hidden` の非公開状態で保存します。承認済み投稿だけが一般公開されます。
          </PolicyNote>
        </div>
      </Section>

      <Section title="送信前の確認">
        <SimpleList items={quickRules} />
      </Section>
    </>
  );
}

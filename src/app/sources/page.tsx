import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { ResearchSourceCard } from "@/components/research-source-card";
import {
  getResearchSourcePipelineMetrics,
  RESEARCH_SOURCES,
} from "@/lib/research-sources";
import { getPublicSourcesStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "情報ソース",
  description:
    "入店前チェック東京で参照する公的・公式情報、報道、調査候補と、転載を避けた扱い方を整理しています。",
  alternates: {
    canonical: "/sources",
  },
};

const editorialPrinciples = [
  "公的機関、自治体、警察、消費生活相談の公式情報を優先して確認します。",
  "報道や記事は、本文や画像を転載せず、出典URL、確認日、独自要約、次に確認すべき点へ分けます。",
  "外部口コミ、SNS投稿、ブログ本文は、公開ページへそのまま載せず、確認候補の背景情報として扱います。",
  "個別店舗の注意報告に進める場合も、現在状況、住所、建物名、階数、異議申立て導線を別途確認します。",
] as const;

const publicValueItems = [
  {
    title: "利用者向けの価値",
    text: "入店前に、料金説明、明細提示、支払い方法、相談先を確認するための入口にします。報道の刺激的な部分ではなく、実際に残すべき資料と相談先へ変換します。",
  },
  {
    title: "審査担当向けの価値",
    text: "出典の種類、確認日、公開可否、候補化の状態を分けることで、承認済み投稿と調査中の背景情報が混ざらないようにします。",
  },
  {
    title: "店舗側・関係者向けの価値",
    text: "断定的なラベル付けを避け、異議申立てや削除申請の導線を維持します。公開する場合も、必要最小限の概要に限定します。",
  },
] as const;

const sourceReviewLanes = [
  {
    title: "公式・公的情報",
    description:
      "相談窓口、条例、行政の取組、警察の注意喚起などです。個別店舗の評価ではなく、入店前確認と相談導線の土台にします。",
  },
  {
    title: "報道・記事",
    description:
      "複数出典、現在状況、住所や建物情報、公開表現を確認するまで、個別の注意報告としては扱いません。",
  },
  {
    title: "自社タレコミ・投稿",
    description:
      "投稿は非公開デフォルトで受け付け、証拠画像や連絡先は管理者確認用に分離します。承認済みの概要だけが公開対象です。",
  },
] as const;

export default function SourcesPage() {
  const metrics = getResearchSourcePipelineMetrics();

  return (
    <>
      <JsonLd data={getPublicSourcesStructuredData()} />
      <PageHeader
        eyebrow="Sources"
        title="情報ソース"
        description="参照元としている公的・公式情報、報道、調査候補を確認できます。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="扱い方">
        <PolicyNote>
          掲載時は出典URL、確認日、独自要約を分けて扱います。本文、口コミ、画像、スクリーンショットは転載しません。
        </PolicyNote>
      </Section>

      <Section
        title="編集基準"
        description="このページはリンク集ではなく、公開前審査のために出典をどう読み替えるかを整理するページです。"
      >
        <SimpleList items={editorialPrinciples} />
      </Section>

      <Section
        title="独自に付け加えている価値"
        description="外部情報をそのまま並べるのではなく、入店前確認、非公開審査、相談導線へ接続します。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {publicValueItems.map((item) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={item.title}
            >
              <h2 className="text-lg font-bold text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="出典の審査レーン"
        description="情報の種類ごとに、公開までの扱いを分けます。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {sourceReviewLanes.map((lane) => (
            <article className="rounded-md border border-line bg-surface p-5" key={lane.title}>
              <h2 className="text-lg font-bold text-ink">{lane.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{lane.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="調査ソースの状況">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "調査ソース", value: metrics.totalSources },
            { label: "公式・公的", value: metrics.officialSources },
            { label: "報道", value: metrics.newsSources },
            { label: "優先確認", value: metrics.highPrioritySources },
            { label: "出典整理中", value: metrics.sourceOnlySources },
            { label: "審査待ち候補", value: metrics.candidateNeedsReviewSources },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
        <Link className="mt-4 inline-flex text-sm font-semibold text-action" href="/coverage">
          エリア別の蓄積状況を見る
        </Link>
      </Section>

      <Section
        title="調査中の情報ソース"
        description="各カードには独自要約と使い道を記載します。個別の出典詳細ページへ誘導せず、この一覧内で扱い方を確認できるようにしています。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {RESEARCH_SOURCES.map((source) => (
            <ResearchSourceCard key={source.id} source={source} />
          ))}
        </div>
      </Section>

      <Section
        title="報告として蓄積するには"
        description="個別の注意報告として扱うには、具体的な経緯、確認日、公開可能な要約、管理者審査が必要です。"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href="/contribute"
          >
            情報提供の方針を見る
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/reports/new"
          >
            注意報告を送る
          </Link>
        </div>
      </Section>
    </>
  );
}

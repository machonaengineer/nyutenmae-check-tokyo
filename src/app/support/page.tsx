import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";

const immediateActions = [
  "その場で身の危険を感じた場合は、支払い交渉より安全確保を優先してください。",
  "緊急時は110番に通報してください。",
  "緊急ではない警察への相談は、警察相談専用電話 #9110 も選択肢になります。",
  "契約や支払いに関する相談先が分からない場合は、消費者ホットライン 188 を確認してください。",
  "カード決済の場合は、クレジットカード会社へ相談し、利用控えや請求明細を保存してください。",
] as const;

const evidenceItems = [
  "レシート、明細、メニュー、料金表、注文履歴を保存する",
  "客引き時の説明内容、入店前に提示された条件、店内での説明を時系列でメモする",
  "日時、人数、同行者情報、支払い方法、請求金額を記録する",
  "Google Maps URL、建物名、階数など、場所を特定できる情報を残す",
  "身の安全を損なう撮影や録音は避ける",
] as const;

const serviceLimitations = [
  "本ページは相談先を整理するための案内であり、法律判断や個別交渉の代理ではありません。",
  "投稿内容は自動公開せず、証拠画像や連絡先は一般公開しません。",
  "入店前チェック東京への投稿と、公的機関やカード会社への相談は別の手続きです。",
] as const;

export const metadata: Metadata = {
  title: "トラブル時の相談先",
  description: "会計や退店時対応に不安がある場合の相談導線と記録しておきたい情報です。",
};

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="トラブル時の相談先"
        description="会計内容、明細提示、退店時対応などで不安がある場合に、相談先と保存しておきたい情報を確認できます。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="まず安全を優先する">
        <SimpleList items={immediateActions} />
        <div className="mt-6">
          <PolicyNote>
            その場で危険を感じる場合は、請求内容の確認や支払い交渉を続けるより、明るい場所への移動、同行者との合流、110番通報など安全確保を優先してください。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="相談先"
        description="番号や案内は変更される可能性があるため、公式ページも確認してください。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">緊急時</h2>
            <p className="mt-3 text-3xl font-bold text-action">110</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              事件や事故など、緊急性がある場合の通報先です。
            </p>
            <a
              className="mt-4 inline-flex text-sm font-semibold text-action"
              href="https://www.npa.go.jp/goiken_index.html"
              rel="noreferrer"
              target="_blank"
            >
              警察庁の案内を確認
            </a>
          </article>

          <article className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">警察への相談</h2>
            <p className="mt-3 text-3xl font-bold text-action">#9110</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              緊急ではない相談や、警察に相談すべきか迷う場合の相談専用電話です。
            </p>
            <a
              className="mt-4 inline-flex text-sm font-semibold text-action"
              href="https://www.npa.go.jp/goiken_index.html"
              rel="noreferrer"
              target="_blank"
            >
              警察庁の案内を確認
            </a>
          </article>

          <article className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">消費生活相談</h2>
            <p className="mt-3 text-3xl font-bold text-action">188</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              契約や支払いに関する相談先が分からない場合、近くの相談窓口につながる案内です。
            </p>
            <a
              className="mt-4 inline-flex text-sm font-semibold text-action"
              href="https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/"
              rel="noreferrer"
              target="_blank"
            >
              消費者庁の案内を確認
            </a>
          </article>
        </div>
      </Section>

      <Section title="保存しておきたい情報">
        <SimpleList items={evidenceItems} />
      </Section>

      <Section title="このサービスでできること">
        <SimpleList items={serviceLimitations} />
      </Section>
    </>
  );
}

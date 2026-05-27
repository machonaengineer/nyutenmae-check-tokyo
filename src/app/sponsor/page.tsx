import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { SponsorInquiryForm } from "./sponsor-inquiry-form";

export const metadata: Metadata = {
  title: "スポンサー・広告掲載について",
  description:
    "入店前チェック東京のスポンサー、広告、支援リンクの掲載独立性と問い合わせ導線です。",
  alternates: {
    canonical: "/sponsor",
  },
};

const sponsorRules = [
  "スポンサーや広告主は、投稿審査、公開順位、リスクタグ、証拠レベルに関与できません。",
  "掲載枠には、証拠画像、投稿者メールアドレス、非公開メモ、外部口コミ本文を含めません。",
  "店舗や個人への断定表現、攻撃表現、クリック依頼、誤認を誘う表示は行いません。",
  "収益化を開始する前に、広告サービス規約、Cookie表示、プライバシーポリシーを確認します。",
] as const;

const suitableSponsors = [
  "防犯、安全な夜間移動、消費者相談、カード不正利用対策に関わるサービス",
  "繁華街での入店前確認や明細保存を支援するツール、メディア、相談窓口",
  "掲載独立性と異議申立て運用を尊重できる広告主、支援者、協賛者",
] as const;

export default function SponsorPage() {
  const inquiryUrl = process.env.NEXT_PUBLIC_SPONSOR_INQUIRY_URL;

  return (
    <>
      <PageHeader
        eyebrow="Sponsor"
        title="スポンサー・広告掲載について"
        description="将来的な収益化は、注意報告の審査と公開判断から独立した形で運用します。"
        primaryAction={{ href: "/monetization-policy", label: "掲載独立性を見る" }}
      />

      <Section title="掲載独立性">
        <SimpleList items={sponsorRules} />
        <div className="mt-6">
          <PolicyNote>
            収益化は本サービスの運営継続のための手段であり、特定の店舗や投稿への判断を左右するものではありません。
          </PolicyNote>
        </div>
      </Section>

      <Section title="相性のよい支援領域">
        <SimpleList items={suitableSponsors} />
      </Section>

      <Section title="問い合わせ">
        <div className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
          <p className="text-sm leading-7 text-muted">
            スポンサー、広告、支援リンクの相談は、掲載独立性と法務確認を前提に個別確認します。
          </p>
          {inquiryUrl ? (
            <a
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
              href={inquiryUrl}
              rel="noreferrer"
              target="_blank"
            >
              問い合わせフォームを開く
            </a>
          ) : (
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
              href="/monetization-policy"
            >
              収益化方針を確認する
            </Link>
          )}
        </div>
      </Section>

      <Section
        title="非公開問い合わせフォーム"
        description="スポンサー、広告掲載、連携、支援の相談を非公開で受け付けます。送信内容は公開ページに表示しません。"
      >
        <SponsorInquiryForm />
      </Section>
    </>
  );
}

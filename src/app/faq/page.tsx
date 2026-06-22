import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { createPageMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "客引きについて行っても大丈夫ですか？",
    answer:
      "判断を急がず、店名、住所、料金表、席料、サービス料、明細の有無を確認してください。不安があれば入店しない判断も選択肢です。",
  },
  {
    question: "入店前に何を確認すべきですか？",
    answer:
      "料金表、税込または税別、席料、サービス料、延長料金、支払い方法、明細と領収書の発行可否を確認してください。",
  },
  {
    question: "料金表がない場合はどうすればいいですか？",
    answer:
      "総額に近い説明を受けられるか確認し、条件が曖昧な場合は入店を急がないことを推奨します。",
  },
  {
    question: "明細や領収書が出ない場合はどうすればいいですか？",
    answer:
      "注文内容、人数、利用時間、請求額、支払い方法、説明内容を記録し、カード控えや請求明細を保存してください。",
  },
  {
    question: "高額な請求で困ったらどこに相談すべきですか？",
    answer:
      "身の危険を感じる場合は110番、緊急ではない警察相談は#9110、契約や支払いの相談は188や消費生活センター、カード決済後はカード会社も確認してください。",
  },
  {
    question: "クレジットカードで支払った後でも相談できますか？",
    answer:
      "カード利用控え、請求明細、説明内容、日時、場所を整理し、カード会社や消費生活相談へ相談できる場合があります。",
  },
  {
    question: "警察相談#9110とは何ですか？",
    answer:
      "緊急ではないが警察へ相談したい時の相談専用電話です。事件や事故など緊急性がある場合は110番を優先してください。",
  },
  {
    question: "消費者ホットライン188とは何ですか？",
    answer:
      "近くの消費生活相談窓口につながる案内です。受付条件や時間は公式ページで確認してください。",
  },
  {
    question: "店名が分からない場合でも情報提供できますか？",
    answer:
      "できます。住所、建物名、階数、案内を受けた場所、Google Maps URL、入口表示など、場所の手がかりを分けて送ってください。",
  },
  {
    question: "店名が変わっているかもしれない場合はどう扱いますか？",
    answer:
      "同一住所や同一建物の情報は確認材料として扱いますが、同一運営や同一店舗であることは断定しません。公開前に管理者が表現を確認します。",
  },
  {
    question: "証拠画像は公開されますか？",
    answer:
      "証拠画像は一般公開しません。管理者確認用として非公開で扱い、公開ページに画像URLや保存先を表示しない設計です。",
  },
  {
    question: "投稿者のメールアドレスは公開されますか？",
    answer:
      "公開されません。連絡用メールアドレスは管理者確認や必要な連絡のために扱い、公開ページには表示しません。",
  },
  {
    question: "情報提供ではどんな書き方が望ましいですか？",
    answer:
      "日時、場所、人数、説明された料金、実際の会計額、明細の有無、相談状況を分けて書いてください。断定や個人情報は避けてください。",
  },
  {
    question: "外部の口コミやSNS投稿をそのまま送ってよいですか？",
    answer:
      "本文の転載は避けてください。出典URL、確認日、独自要約、関連する確認テーマとして扱います。",
  },
  {
    question: "掲載されている情報は確定情報ですか？",
    answer:
      "確定情報として断定するものではありません。投稿者の申告に基づく情報や事実確認中の情報を含みます。",
  },
  {
    question: "情報が少ないエリアでも使う意味はありますか？",
    answer:
      "あります。公開報告が少ない段階でも、料金確認、明細保存、相談先、情報提供の入口を確認できます。",
  },
  {
    question: "投稿した情報は公開されますか？",
    answer:
      "投稿は自動公開されません。管理者が内容、表現、個人情報、公開範囲を確認したうえで判断します。",
  },
  {
    question: "店舗から異議申立てがあった場合はどうなりますか？",
    answer:
      "対象内容を確認し、必要に応じて一時非公開、表現修正、追加確認、削除判断を行います。",
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "FAQ｜入店前チェック東京",
  description:
    "入店前の料金確認、明細、相談先、情報提供、異議申立てに関するよくある質問を整理しています。",
  path: "/faq",
  imageLabel: "FAQ・料金確認・相談先",
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        eyebrow="FAQ"
        title="よくある質問"
        description="入店前の料金確認、明細、相談先、情報提供の扱いについて、断定を避けながら確認できる形でまとめます。"
        primaryAction={{ href: "/checklists", label: "チェックリストを見る" }}
      />

      <Section title="FAQ">
        <div className="grid gap-4">
          {faqItems.map((item) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={item.question}
            >
              <h2 className="text-lg font-bold text-ink">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <PolicyNote>
            本ページは一般的な確認ポイントと相談先を整理したものです。個別の法的判断や返金可否を保証するものではありません。緊急時や不安を感じる場合は、警察、消費生活センター、カード会社などの適切な窓口に相談してください。
          </PolicyNote>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href="/support"
          >
            相談先を確認する
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/reports/quick"
          >
            30秒で情報提供する
          </Link>
        </div>
      </Section>
    </>
  );
}

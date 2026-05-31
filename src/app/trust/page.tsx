import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "掲載方針・確認レベル｜入店前チェック東京",
  description:
    "入店前チェック東京が扱う情報、扱わない情報、公開しない情報、確認レベル、未確認情報、異議申立て、削除や訂正の判断方針を説明します。",
  path: "/trust",
  imageLabel: "掲載方針・確認レベル・異議申立て",
});

const publicItems = [
  "管理者が承認した公開サマリー",
  "エリア、住所または場所の手がかり、建物名、階数",
  "リスクタグ、証拠レベル、最新報告日",
  "出典URL、確認日、独自要約",
  "相談先、入店前確認リスト、記録保存ガイド",
] as const;

const privateItems = [
  "投稿者メールアドレス",
  "証拠画像と保存先",
  "非公開メモ",
  "管理者操作の内部メモ",
  "店員個人名、顔写真、電話番号、SNS ID",
] as const;

const reviewSteps = [
  "投稿または候補を非公開で受け付ける",
  "禁止表現、個人情報、転載リスクを確認する",
  "証拠と投稿者の申告を分けて確認する",
  "公開サマリーを断定しない表現へ整える",
  "承認済み情報だけを公開ページへ反映する",
] as const;

const handledItems = [
  "料金説明、会計内容、明細提示、退店時対応に関する情報",
  "住所、建物名、階数など場所確認に必要な手がかり",
  "公的機関、自治体、警察、消費生活相談の公式情報",
  "投稿者の申告と証拠レベルを分けた公開サマリー",
] as const;

const notHandledItems = [
  "味、雰囲気、通常接客の感想",
  "根拠不明の断定、犯罪や違法性の断定",
  "個人名、従業員名、顔写真、電話番号、SNSアカウント",
  "外部口コミ本文、ニュース本文、SNS投稿本文の転載",
] as const;

const correctionRules = [
  "対象URL、申立て理由、訂正希望内容、関係者確認、連絡先を確認します。",
  "個人情報や権利侵害の懸念がある場合は一時非公開を含めて判断します。",
  "公開サマリーは、必要最小限の範囲で表現修正、非公開化、削除を検討します。",
  "虚偽申立てや嫌がらせと判断される内容は対応対象外にする場合があります。",
] as const;

const safetySignals = [
  "投稿は自動公開しません。",
  "事実確認中の情報を含むことを明記します。",
  "異議申立てがある場合は再確認を優先します。",
  "収益化は掲載判断や表示順位に影響しません。",
  "公開APIを作る場合も公開ビューだけを対象にします。",
] as const;

export default function TrustPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust"
        title="透明性と安全運用"
        description="入店前チェック東京は、注意情報として役立つことと、断定・個人情報公開・営業妨害リスクを避けることを両立するために運用しています。"
        primaryAction={{ href: "/guidelines", label: "投稿ガイドライン" }}
      />

      <Section title="基本方針">
        <PolicyNote>
          掲載内容は投稿者の申告や公式ソースの確認に基づく注意情報です。味、雰囲気、通常接客の評価は扱わず、料金説明、会計確認、明細提示、退店時対応に関わる情報に限定します。
        </PolicyNote>
      </Section>

      <Section
        title="扱う情報"
        description="店舗レビューではなく、入店前確認に必要な情報に限定します。"
      >
        <TrustGrid items={handledItems} />
      </Section>

      <Section
        title="扱わない情報"
        description="個人攻撃、根拠不明の断定、外部本文の転載は掲載しません。"
      >
        <TrustGrid items={notHandledItems} />
      </Section>

      <Section
        title="公開する情報"
        description="一般公開するのは、入店前確認に役立つ範囲へ丸めた情報です。"
      >
        <TrustGrid items={publicItems} />
      </Section>

      <Section
        title="公開しない情報"
        description="投稿者、証拠、管理者メモ、個人情報は公開ページに出しません。"
      >
        <TrustGrid items={privateItems} />
      </Section>

      <Section
        title="審査の流れ"
        description="公開前に、表現、出典、証拠、個人情報の確認を行います。"
      >
        <ol className="grid gap-3 md:grid-cols-5">
          {reviewSteps.map((step, index) => (
            <li
              className="rounded-md border border-line bg-white p-4 text-sm leading-7 text-muted"
              key={step}
            >
              <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-action text-xs font-bold text-white">
                {index + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="訂正・非公開・削除の判断"
        description="異議申立てや削除依頼があった場合の確認観点です。"
      >
        <TrustGrid items={correctionRules} />
      </Section>

      <Section
        title="安全シグナル"
        description="サービス拡大時も、公開条件と収益化の独立性を崩しません。"
      >
        <TrustGrid items={safetySignals} />
      </Section>

      <Section
        title="関連ページ"
        description="投稿、異議申立て、収益化、情報ソースの方針を分けて確認できます。"
      >
        <div className="grid gap-3 md:grid-cols-4">
          <TrustLink href="/reports/new" label="注意報告を送る" />
          <TrustLink href="/objection" label="異議申立て" />
          <TrustLink href="/sources" label="情報ソース" />
          <TrustLink href="/monetization-policy" label="収益化方針" />
        </div>
      </Section>
    </>
  );
}

function TrustGrid({ items }: { items: readonly string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-md border border-line bg-white p-4 text-sm leading-7 text-muted">
          {item}
        </div>
      ))}
    </div>
  );
}

function TrustLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-line bg-surface px-4 py-3 text-sm font-bold text-action no-underline transition hover:bg-paper"
      href={href}
    >
      {label}
    </Link>
  );
}

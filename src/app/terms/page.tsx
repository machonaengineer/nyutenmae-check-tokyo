import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";

const serviceTerms = [
  "本サービスは投稿者の申告に基づく注意情報を、管理者確認後に掲載します。",
  "掲載内容は店舗や個人の総合評価ではありません。",
  "味、雰囲気、通常接客の評価は主な対象ではありません。",
  "掲載情報には事実確認中の内容が含まれる場合があります。",
] as const;

const userObligations = [
  "投稿者は、確認できる範囲で正確な情報を入力してください。",
  "投稿者は、虚偽、誇張、競合関係を利用した嫌がらせ目的の投稿を行わないものとします。",
  "個人名、顔写真、電話番号、SNS ID、住所の部屋番号など、個人を特定し得る情報を投稿しないでください。",
  "犯罪、属性、組織関係などを決めつける表現、侮辱、脅迫、差別的表現を投稿しないでください。",
] as const;

const moderationTerms = [
  "管理者は、公開前審査、非公開化、修正依頼、削除を行うことがあります。",
  "管理者は、投稿の趣旨を変えない範囲で公開サマリーを調整することがあります。",
  "証拠画像、投稿者メールアドレス、管理者メモは一般公開しません。",
  "投稿内容に関する異議申立ては、専用ページから受け付けます。",
] as const;

const monetizationTerms = [
  "広告、スポンサー、支援リンクは、投稿審査、公開順位、リスクタグ、証拠レベルに影響しません。",
  "広告表示を有効化する場合でも、投稿者メールアドレス、証拠画像、管理者メモを広告枠に含めません。",
  "利用者に広告クリックや支援を依頼する表示は行いません。",
] as const;

const disclaimers = [
  "本サービスは法律相談、紛争解決、返金交渉、行政機関への申立てを代行するものではありません。",
  "利用者は、掲載情報だけでなく、入店前の料金確認、明細確認、公式相談窓口への相談などを組み合わせて判断してください。",
  "運営者は、故意または重過失がある場合を除き、掲載情報の利用により生じた損害について責任を負いません。",
] as const;

export const metadata: Metadata = {
  title: "利用規約",
  description: "入店前チェック東京の利用規約です。",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Terms"
        title="利用規約"
        description="入店前チェック東京を利用する際の基本条件です。正式公開前に専門家確認を前提として更新します。"
      />
      <Section title="サービスの位置づけ">
        <SimpleList items={serviceTerms} />
      </Section>

      <Section title="利用者の責任">
        <SimpleList items={userObligations} />
      </Section>

      <Section title="公開審査と異議申立て">
        <SimpleList items={moderationTerms} />
      </Section>

      <Section title="収益化と掲載独立性">
        <SimpleList items={monetizationTerms} />
      </Section>

      <Section title="免責">
        <SimpleList items={disclaimers} />
        <div className="mt-6">
          <PolicyNote>
            本規約はMVP用の初期文案です。本番公開前に、サービス運用地域、運営主体、問い合わせ先、保存期間、削除対応手順を確定してください。
          </PolicyNote>
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { PUBLICATION_RULES, TONE_GUIDELINES } from "@/lib/site";

const acceptedTopics = [
  "客引き経由で入店した際の説明内容",
  "入店前説明と会計内容の不一致",
  "明細提示の有無や確認時の対応",
  "会計時の説明、確認、支払いに関する経緯",
  "退店時対応に関する事実経過",
] as const;

const notAcceptedTopics = [
  "味、雰囲気、通常接客の感想",
  "個人名、顔写真、電話番号、SNS IDなどの公開",
  "犯罪や属性を決めつける表現",
  "脅迫、差別、個人攻撃を含む投稿",
  "競合関係や嫌がらせ目的が疑われる投稿",
] as const;

const writingRules = [
  "日時、人数、説明された金額、請求金額、明細提示の有無など、確認可能な事実を中心に書いてください。",
  "店舗や個人を攻撃する表現ではなく、料金説明と会計内容の差、確認した行動、相談状況を記録してください。",
  "伝聞の場合は、誰から聞いたかではなく、自分が確認した範囲を明確にしてください。",
  "証拠画像に個人名、顔、電話番号、カード番号などが含まれる場合は、公開前に管理者が確認します。",
] as const;

const moderationRules = [
  "投稿はpendingで保存され、承認されるまで一般公開されません。",
  "公開サマリーは、管理者が断定表現、個人情報、過度な攻撃表現を確認してから掲載します。",
  "危険表現や個人情報が含まれる場合、差し戻し、修正、非公開、削除の対象になります。",
  "証拠画像と投稿者メールアドレスは管理者のみ確認します。",
] as const;

export const metadata: Metadata = {
  title: "投稿ガイドライン",
  description: "入店前チェック東京の投稿方針と公開基準です。",
};

export default function GuidelinesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guidelines"
        title="投稿ガイドライン"
        description="このサービスは口コミ評価ではなく、入店前の料金確認に役立つ注意報告を扱います。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="扱う内容">
        <SimpleList items={acceptedTopics} />
      </Section>

      <Section title="扱わない内容">
        <SimpleList items={notAcceptedTopics} />
      </Section>

      <Section title="書き方">
        <SimpleList items={writingRules} />
        <div className="mt-6">
          <PolicyNote>
            投稿本文に断定、侮辱、個人攻撃、犯罪や属性の決めつけと受け取られる表現が含まれる場合、フォーム上で注意を表示し、公開審査でも修正または非公開の対象にします。
          </PolicyNote>
        </div>
      </Section>

      <Section title="公開ルール">
        <SimpleList items={PUBLICATION_RULES} />
      </Section>

      <Section title="審査ルール">
        <SimpleList items={moderationRules} />
      </Section>

      <Section title="文言トーン">
        <SimpleList items={TONE_GUIDELINES} />
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";

const collectedItems = [
  "投稿者または申立て者のメールアドレス、申告内容、対象場所に関する情報",
  "証拠画像、ファイル名、ファイル形式、ファイルサイズ",
  "管理者による審査メモ、ステータス変更履歴、操作ログ",
  "不正利用対策、障害調査、アクセス解析に必要な技術情報",
] as const;

const usagePurposes = [
  "投稿内容の確認、公開可否判断、差し戻し連絡、異議申立て対応",
  "証拠レベルの判断、個人情報や危険表現の確認、公開サマリーの調整",
  "不正投稿、虚偽投稿、競合嫌がらせ、スパムの抑止",
  "サービスの安全性、表示品質、運用フローの改善",
  "広告やアクセス解析を有効化した場合の表示改善、配信品質確認、不正利用対策",
] as const;

const publicationPolicy = [
  "投稿者メールアドレス、申立て者メールアドレス、証拠画像、管理者メモは一般公開しません。",
  "公開ページには、承認済み投稿から作成した公開サマリー、リスクタグ、証拠レベル、報告件数など必要最小限の情報だけを表示します。",
  "店員個人名、顔写真、電話番号、SNS IDなど、個人を特定し得る情報は公開対象にしません。",
  "個人情報や権利侵害の懸念がある場合、公開前または公開後に非公開化、修正、削除を行うことがあります。",
] as const;

const userRequests = [
  "削除、修正、開示、利用停止に関する問い合わせは異議申立てページから受け付けます。",
  "本人確認や対象投稿の特定に必要な情報を追加で確認する場合があります。",
  "法令上または安全運用上、一定期間ログや証拠情報を保存することがあります。",
] as const;

const thirdPartyServices = [
  "Google Analytics 4、Vercel Web Analytics、AdSense等の外部サービスを、アクセス解析、表示改善、広告配信品質確認のために利用する場合があります。",
  "Google Analytics 4では、ページ閲覧、参照元、端末やブラウザの技術情報などがGoogleに送信される場合があります。",
  "AdSenseを有効化した場合、広告配信や不正利用対策のためにGoogle等の広告事業者がCookie等を利用することがあります。",
  "広告サービスは、証拠画像、投稿者メールアドレス、申立て者メールアドレス、管理者メモへアクセスしません。",
] as const;

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "入店前チェック東京の個人情報と証拠資料の扱いです。",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="プライバシーポリシー"
        description="投稿者情報、証拠資料、管理者メモを公開情報と分けて扱うための方針です。"
      />
      <Section title="取得する情報">
        <SimpleList items={collectedItems} />
      </Section>

      <Section title="利用目的">
        <SimpleList items={usagePurposes} />
      </Section>

      <Section title="公開しない情報">
        <SimpleList items={publicationPolicy} />
      </Section>

      <Section title="外部サービスと広告Cookie">
        <SimpleList items={thirdPartyServices} />
      </Section>

      <Section title="問い合わせと保存">
        <SimpleList items={userRequests} />
        <div className="mt-6">
          <PolicyNote>
            本ポリシーはMVP用の初期文案です。本番公開前に、運営者情報、問い合わせ先、保存期間、第三者提供の有無、委託先管理を確定してください。
          </PolicyNote>
        </div>
      </Section>
    </>
  );
}

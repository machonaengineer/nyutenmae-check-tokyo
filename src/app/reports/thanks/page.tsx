import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";

const nextSteps = [
  "投稿は非公開の状態で保存されました。",
  "管理者が内容、表現、個人情報、証拠画像を確認します。",
  "承認された場合のみ、投稿者の申告に基づく注意情報として公開します。",
  "証拠画像と連絡用メールアドレスは一般公開しません。",
] as const;

export const metadata: Metadata = {
  title: "投稿を受け付けました",
  description: "入店前チェック東京の投稿完了ページです。",
};

export default function ReportThanksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Received"
        title="投稿を受け付けました"
        description="送信内容は非公開で保存されています。公開前に管理者が確認します。"
      />
      <Section title="確認の流れ">
        <SimpleList items={nextSteps} />
        <div className="mt-6">
          <PolicyNote>
            掲載時も断定表現は避け、投稿者の申告に基づく情報として必要最小限の内容だけを表示します。
          </PolicyNote>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
          >
            ホームへ戻る
          </Link>
          <Link
            href="/guidelines"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            投稿ガイドラインを見る
          </Link>
          <Link
            href="/social"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            安全な共有文を見る
          </Link>
        </div>
      </Section>
    </>
  );
}

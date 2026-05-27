import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { SocialProfileLinks } from "@/components/social-profile-links";
import { SocialShareActions } from "@/components/social-share-actions";
import { getAbsoluteSiteUrl } from "@/lib/social";
import { INITIAL_AREAS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "SNS共有・情報提供",
  description:
    "入店前チェック東京をSNSで共有し、注意報告や情報提供につなげるためのページです。",
  alternates: {
    canonical: "/social",
  },
};

const shareRules = [
  "店舗や個人への断定、攻撃、個人情報を含む投稿は避けてください。",
  "外部口コミ本文、ニュース本文、スクリーンショットをそのまま転載しないでください。",
  "掲載内容は投稿者の申告に基づく注意情報として紹介してください。",
  "緊急時や身の危険がある場合はSNS投稿より安全確保と相談を優先してください。",
] as const;

export default function SocialPage() {
  return (
    <>
      <PageHeader
        eyebrow="Social"
        title="SNS共有・情報提供"
        description="入店前の料金確認に役立つ情報を、断定や転載を避けた形で広げるための共有ページです。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="共有する">
        <SocialShareActions title={SITE.name} url={getAbsoluteSiteUrl("/")} />
        <div className="mt-6">
          <PolicyNote>
            共有文は注意喚起の入口として扱い、個別店舗や個人を断定する表現を避けてください。
          </PolicyNote>
        </div>
      </Section>

      <Section title="公式SNS">
        <SocialProfileLinks />
        <p className="mt-4 text-sm leading-7 text-muted">
          SNSアカウントURLが未設定の場合、この欄は表示されません。
        </p>
      </Section>

      <Section title="共有時のルール">
        <SimpleList items={shareRules} />
      </Section>

      <Section
        title="エリア別に共有する"
        description="初期対象エリアごとのページを共有できます。承認済み投稿がない場合も、情報提供導線として利用できます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <article key={area.slug} className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">{area.name}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{area.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/areas/${area.slug}`}
                >
                  エリアページ
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/reports/new?area=${area.slug}`}
                >
                  情報提供
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

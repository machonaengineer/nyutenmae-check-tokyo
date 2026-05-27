import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { SocialProfileLinks } from "@/components/social-profile-links";
import { SocialShareActions } from "@/components/social-share-actions";
import {
  AREA_GROWTH_PRIORITY_LABELS,
  getPrioritySortedAreaGrowthPlans,
} from "@/lib/area-growth";
import { getSocialRecognitionPosts } from "@/lib/social-campaigns";
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
  const growthPlans = getPrioritySortedAreaGrowthPlans();
  const recognitionPosts = getSocialRecognitionPosts();

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
        title="安全投稿テンプレート"
        description="エリア名と確認項目を中心にし、個別店舗や個人への断定を避ける投稿案です。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {growthPlans.map((plan) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={plan.areaSlug}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-ink">{plan.areaName}</h2>
                <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                  {AREA_GROWTH_PRIORITY_LABELS[plan.priority]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{plan.snsTemplate}</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                投稿者の申告に基づく情報です。入店前の料金確認を推奨します。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/areas/${plan.areaSlug}`}
                >
                  エリアページ
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/reports/new?area=${plan.areaSlug}`}
                >
                  情報提供
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="30日分の投稿企画"
        description="自動投稿は行わず、投稿前チェックを前提に使える安全な文面素材です。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {recognitionPosts.map((post) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={`${post.day}-${post.title}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink">Day {post.day}: {post.title}</p>
                <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                  {post.slot}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{post.body}</p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                href={post.targetPath}
              >
                配布先ページ
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="エリア別に共有する"
        description="掲載対象エリアごとのページを共有できます。承認済み投稿がない場合も、情報提供導線として利用できます。"
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

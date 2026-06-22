import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { LeafletMap } from "@/components/leaflet-map";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import { ResearchSourceCard } from "@/components/research-source-card";
import { SocialShareActions } from "@/components/social-share-actions";
import { getAreaDeepGuide } from "@/lib/area-content";
import {
  AREA_GROWTH_PRIORITY_LABELS,
  getAreaGrowthPlan,
} from "@/lib/area-growth";
import {
  getAreaCenter,
  getPublicAreaSummary,
  getPublicPlaceSummaries,
} from "@/lib/public-data";
import {
  getResearchSourceIntakeStatus,
  getResearchSourcesByArea,
} from "@/lib/research-sources";
import { SEARCH_GUIDES } from "@/lib/search-guides";
import { getAbsoluteSiteUrl } from "@/lib/social";
import { createPageMetadata } from "@/lib/seo";
import { INITIAL_AREAS } from "@/lib/site";
import { TOPIC_GUIDES } from "@/lib/topic-content";

type AreaPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = await getPublicAreaSummary(slug);

  if (!area) {
    return {
      title: "対象エリア",
    };
  }

  return createPageMetadata({
    title: `${area.name}の入店前チェック｜料金確認・相談先・注意情報`,
    description: `${area.name}周辺で入店前に確認したい料金説明、明細、相談先、客引きに関する注意情報を整理しています。根拠不明の断定ではなく、確認しやすい項目と公的相談先を掲載します。`,
    path: `/areas/${slug}`,
    imageLabel: `${area.name}・料金確認・相談先`,
  });
}

const areaChecklistItems = [
  "店名、住所、建物名、階数を入店前に確認する",
  "料金表、席料、サービス料、延長料金、税込または税別を確認する",
  "飲み放題やセット料金は対象範囲と終了時刻を確認する",
  "明細、領収書、カード利用控えを受け取れるか確認する",
  "不安がある場合は入店しない判断も選択肢にする",
] as const;

const areaRecordItems = [
  "説明された料金、店内での説明、会計時の説明を分けてメモする",
  "レシート、明細、メニュー、料金表、カード利用控えを保存する",
  "日時、人数、同行者情報、入店経路、相談状況を記録する",
] as const;

export default async function AreaDetailPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const area = await getPublicAreaSummary(slug);

  if (!area) {
    notFound();
  }

  const places = await getPublicPlaceSummaries({ areaSlug: slug });
  const markerPlaces = places.filter(
    (place) => place.latitude !== null && place.longitude !== null,
  );
  const researchSources = getResearchSourcesByArea(slug);
  const officialSourceCount = researchSources.filter(
    (source) => source.sourceType !== "news",
  ).length;
  const reviewCandidateCount = researchSources.filter(
    (source) => getResearchSourceIntakeStatus(source) === "candidate_needs_review",
  ).length;
  const guide = getAreaDeepGuide(slug);
  const growthPlan = getAreaGrowthPlan(slug);

  return (
    <>
      <PageHeader
        eyebrow="Area"
        title={`${area.name}の入店前チェック`}
        description={`${area.centerLabel}で入店前に確認したい情報をまとめています。`}
        primaryAction={{ href: "/map", label: "地図を見る" }}
      />

      <Section
        title={`${area.name}周辺で確認したいこと`}
        description={`${area.name}周辺では、飲食店や接待を伴う店舗が集まるエリアがあり、入店前の料金説明、席料、サービス料、延長料金、支払い方法、明細の有無を確認しておくことが重要です。掲載情報は、利用者が冷静に確認するためのものであり、店舗や個人を断定的に非難するものではありません。`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">入店前チェック</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
              {areaChecklistItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">会計前後に残す情報</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
              {areaRecordItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href={`/areas/${slug}/checklist`}
          >
            チェックリストを見る
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/support"
          >
            相談先を確認する
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href={`/reports/quick?area=${slug}`}
          >
            30秒で情報提供する
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/trust"
          >
            掲載方針を見る
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/objection"
          >
            異議申立て
          </Link>
        </div>
      </Section>

      <Section
        title="エリア地図"
        description="公開できる位置情報がある場所と、エリアの中心付近を確認できます。"
      >
        <LeafletMap center={getAreaCenter(slug)} places={markerPlaces} zoom={14} />
        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      <Section title="このエリアの公開情報">
        <div className="mb-6">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href={`/areas/${slug}/checklist`}
          >
            このエリアの確認リストを見る
          </Link>
          <Link
            className="ml-0 mt-3 inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper sm:ml-3 sm:mt-0"
            href={`/areas/${slug}/evidence`}
          >
            記録保存ガイドを見る
          </Link>
          <Link
            className="ml-0 mt-3 inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper sm:ml-3 sm:mt-0"
            href={`/areas/${slug}/contribute`}
          >
            情報提供の粒度を見る
          </Link>
        </div>
        {places.length > 0 ? (
          <div className="grid gap-4">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <>
            <EmptyState message="このエリアは公開できる個別報告を育てている段階です。場所、料金説明、明細の手がかりを募集しています。" />
            <div className="mt-5 rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <div className="grid gap-3 text-sm text-muted sm:grid-cols-3">
                <p>承認済み報告: 0件</p>
                <p>公式確認先: {officialSourceCount}件</p>
                <p>審査中の確認候補: {reviewCandidateCount}件</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                まずは公式確認先、入店前の確認項目、情報提供フォームを案内します。店名が曖昧でも、住所、建物名、階数、料金説明、明細の有無があれば非公開で送信できます。
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  "案内を受けた場所と入店先の住所",
                  "入店前と会計時の説明差",
                  "明細、領収書、カード控えの有無",
                ].map((item) => (
                  <div
                    className="rounded-md border border-line bg-surface px-4 py-3 text-sm font-semibold leading-6 text-ink"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {researchSources.slice(0, 3).map((source) => (
                  <article
                    key={source.id}
                    className="rounded-md border border-line bg-surface p-4"
                  >
                    <p className="text-xs font-semibold text-action">
                      確認日: {source.sourceCheckedAt}
                    </p>
                    <h3 className="mt-2 text-sm font-bold leading-6 text-ink">
                      {source.sourceTitle}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted">
                      {source.publicSummary}
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
                  href={`/reports/quick?area=${slug}`}
                >
                  情報提供する
                </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                href="/guides/before-entry-price-check"
              >
                料金確認ガイドを見る
              </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href="/support"
                >
                  相談先を見る
                </Link>
              </div>
            </div>
          </>
        )}
      </Section>

      {guide ? (
        <Section
          title="このエリアで確認したいこと"
          description={guide.profile}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">入店前</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                {guide.preEntryChecks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">会計前後</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                {guide.billingChecks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </Section>
      ) : null}

      {growthPlan ? (
        <Section
          title="情報提供してほしい具体項目"
          description={growthPlan.searchIntent}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <p className="text-xs font-semibold text-action">
                {AREA_GROWTH_PRIORITY_LABELS[growthPlan.priority]}
              </p>
              <h2 className="mt-2 text-lg font-bold text-ink">提供してほしい情報</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {growthPlan.contributionAsk}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {growthPlan.immediateDataNeed}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
                  href={`/reports/new?area=${slug}`}
                >
                  情報提供する
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/areas/${slug}/contribute`}
                >
                  入力粒度を見る
                </Link>
              </div>
            </article>
            <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <h2 className="text-lg font-bold text-ink">公開投稿が少ない段階の価値</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {growthPlan.publicZeroStateValue}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {growthPlan.monetizationGate}
              </p>
              <div className="mt-5">
                <PolicyNote>
                  送信内容は管理者確認後に必要な範囲で公開します。連絡先や添付資料は公開ページに出しません。
                </PolicyNote>
              </div>
            </article>
          </div>
        </Section>
      ) : null}

      <Section
        title="このエリアの実用ガイド"
        description="検索されやすい場面別に、入店前確認、資料保存、相談準備を確認できます。"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SEARCH_GUIDES.map((guide) => (
            <Link
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/guides/${guide.slug}`}
              key={guide.slug}
            >
              {guide.shortTitle}
              <span className="mt-2 block font-normal leading-6 text-muted">
                {guide.description}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="このエリアの種別別ガイド"
        description="料金説明、明細提示、客引き経由の来店など、テーマ別に確認項目を整理しています。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {TOPIC_GUIDES.map((topic) => (
            <Link
              key={topic.slug}
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/topics/${topic.slug}`}
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="このエリアの公式確認先"
        description="地域の取組や相談先を確認するためのリンクです。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {researchSources.map((source) => (
            <ResearchSourceCard key={source.id} source={source} />
          ))}
        </div>
      </Section>

      <Section title="このエリアを共有する">
        <SocialShareActions title={`${area.name}の入店前確認`} url={getAbsoluteSiteUrl(`/areas/${slug}`)} />
      </Section>
    </>
  );
}

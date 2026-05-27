import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import { ResearchSourceCard } from "@/components/research-source-card";
import { SiteSearchForm } from "@/components/site-search-form";
import { filterPublicPlacesByQuery, getPublicPlaceSummaries } from "@/lib/public-data";
import { filterResearchSourcesByQuery } from "@/lib/research-sources";
import { INITIAL_AREAS } from "@/lib/site";

export const metadata: Metadata = {
  title: "店舗名・住所検索",
  description: "承認済みの注意報告がある場所を、店舗名や住所の手がかりから検索します。",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";
  const places = query
    ? filterPublicPlacesByQuery(await getPublicPlaceSummaries(), query)
    : [];
  const relatedAreas = query
    ? INITIAL_AREAS.filter((area) => {
        const searchableText = [area.name, area.center, area.summary]
          .join(" ")
          .toLowerCase();

        return query
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)
          .every((term) => searchableText.includes(term));
      })
    : [];
  const relatedSources = query ? filterResearchSourcesByQuery(query) : [];

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="店舗名・住所検索"
        description="承認済みの注意報告がある場所だけを検索対象にします。証拠画像、投稿者メールアドレス、管理者メモは検索対象にしません。"
        primaryAction={{ href: "/map", label: "地図を見る" }}
      />

      <Section title="検索">
        <div className="rounded-md border border-line bg-surface p-5">
          <SiteSearchForm defaultValue={query} variant="wide" />
          <p className="mt-3 text-xs leading-5 text-muted">
            店舗名、住所、建物名、エリア名の手がかりで検索できます。掲載内容は投稿者の申告に基づく情報です。
          </p>
        </div>
      </Section>

      <Section
        title={query ? `検索結果: ${places.length}件` : "検索結果"}
        description={
          query
            ? `「${query}」に一致する公開可能な場所を表示します。`
            : "検索語を入力すると、承認済み投稿がある場所だけを表示します。"
        }
      >
        {query ? (
          places.length > 0 ? (
            <div className="grid gap-4">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <EmptyState message="現在、承認済みの公開情報では一致する場所はありません。" />
          )
        ) : (
          <PolicyNote>
            未承認投稿、投稿者メールアドレス、証拠画像、非公開メモは検索結果に表示しません。
          </PolicyNote>
        )}
        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      {query && (relatedAreas.length > 0 || relatedSources.length > 0) ? (
        <Section
          title="関連する確認先"
          description="承認済み投稿が少ない場合でも、近いエリアや公式情報から入店前確認を始められます。"
        >
          {relatedAreas.length > 0 ? (
            <div className="mb-6 grid gap-3 md:grid-cols-2">
              {relatedAreas.map((area) => (
                <Link
                  key={area.slug}
                  className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
                  href={`/areas/${area.slug}`}
                >
                  {area.name}
                  <span className="mt-2 block text-xs font-normal leading-5 text-muted">
                    {area.center}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
          {relatedSources.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {relatedSources.map((source) => (
                <ResearchSourceCard key={source.id} source={source} />
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}

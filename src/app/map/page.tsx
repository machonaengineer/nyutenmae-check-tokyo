import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { LeafletMap } from "@/components/leaflet-map";
import { PageHeader, Section } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import { getAreaCenter, getPublicPlaceSummaries } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "地図",
  description: "承認済みの注意報告がある場所を地図で確認するページです。",
};

export default async function MapPage() {
  const places = await getPublicPlaceSummaries();
  const markerPlaces = places.filter(
    (place) => place.latitude !== null && place.longitude !== null,
  );

  return (
    <>
      <PageHeader
        eyebrow="Map"
        title="注意報告マップ"
        description="承認済みの注意報告がある場所のみを表示します。証拠画像、投稿者メールアドレス、管理者メモは表示しません。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section
        title="地図"
        description="OpenStreetMapを利用しています。表示位置は公開可能な範囲で管理者が確認した情報に限定します。"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <LeafletMap center={getAreaCenter()} places={markerPlaces} zoom={12} />

          <aside className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">表示対象</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              地図には、承認済み投稿があり、公開可能な緯度経度が登録された場所だけを表示します。
            </p>
            <div className="mt-5 grid gap-3 text-sm text-muted">
              <p>地図表示: {markerPlaces.length}件</p>
              <p>承認済み投稿のある場所: {places.length}件</p>
            </div>
            <Link
              href="/areas"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-ink no-underline hover:bg-paper"
            >
              エリア一覧を見る
            </Link>
          </aside>
        </div>

        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      <Section title="承認済み投稿がある場所">
        {places.length > 0 ? (
          <div className="grid gap-4">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState message="現在、一般公開できる承認済み投稿はありません。" />
        )}
      </Section>
    </>
  );
}

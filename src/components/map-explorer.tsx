"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { LeafletMap } from "@/components/leaflet-map";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import type { PublicPlaceSummary } from "@/lib/public-data";

type AreaOption = {
  slug: string;
  name: string;
  center: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

type MapFilters = {
  area: string;
  tag: string;
  evidence: string;
  query: string;
};

type MapExplorerProps = {
  places: PublicPlaceSummary[];
  center: {
    latitude: number;
    longitude: number;
  };
  areaOptions: AreaOption[];
  initialFilters: MapFilters;
  sourceMetrics: {
    officialSources: number;
    candidateNeedsReviewSources: number;
  };
};

const issueTagOptions = [
  { value: "solicitation", label: "客引き経由", tokens: ["客引き"] },
  { value: "price", label: "料金説明", tokens: ["料金説明", "高額請求", "席料", "サービス料", "飲み放題"] },
  { value: "itemized", label: "明細提示", tokens: ["明細提示"] },
  { value: "checkout", label: "会計時対応", tokens: ["会計時"] },
  { value: "exit", label: "退店時対応", tokens: ["退店時"] },
] as const;

const evidenceOptions = ["S", "A", "B", "C", "D"] as const;

function normalizeFilters(filters: MapFilters): MapFilters {
  return {
    area: filters.area.trim(),
    tag: filters.tag.trim(),
    evidence: filters.evidence.trim(),
    query: filters.query.trim(),
  };
}

function matchesTag(place: PublicPlaceSummary, tagValue: string) {
  if (!tagValue) {
    return true;
  }

  const option = issueTagOptions.find((item) => item.value === tagValue);
  if (!option) {
    return true;
  }

  return place.riskTags.some((tag) =>
    option.tokens.some((token) => tag.includes(token)),
  );
}

function matchesQuery(place: PublicPlaceSummary, query: string) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return true;
  }

  const searchableText = [
    place.shopName,
    place.address,
    place.buildingName,
    place.floor,
    place.areaName,
    ...place.riskTags,
    ...place.evidenceLevels,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.every((term) => searchableText.includes(term));
}

function buildUrl(filters: MapFilters) {
  const normalized = normalizeFilters(filters);
  const params = new URLSearchParams();

  if (normalized.area) {
    params.set("area", normalized.area);
  }
  if (normalized.tag) {
    params.set("tag", normalized.tag);
  }
  if (normalized.evidence) {
    params.set("evidence", normalized.evidence);
  }
  if (normalized.query) {
    params.set("q", normalized.query);
  }

  const query = params.toString();
  return query ? `/map?${query}` : "/map";
}

export function MapExplorer({
  places,
  center,
  areaOptions,
  initialFilters,
  sourceMetrics,
}: MapExplorerProps) {
  const [filters, setFilters] = useState(() => normalizeFilters(initialFilters));

  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        if (filters.area && place.areaSlug !== filters.area) {
          return false;
        }
        if (filters.evidence && !place.evidenceLevels.includes(filters.evidence)) {
          return false;
        }
        if (!matchesTag(place, filters.tag)) {
          return false;
        }
        return matchesQuery(place, filters.query);
      }),
    [filters, places],
  );

  const markerPlaces = filteredPlaces.filter(
    (place) => place.latitude !== null && place.longitude !== null,
  );

  const selectedArea = areaOptions.find((area) => area.slug === filters.area);
  const mapCenter = selectedArea?.coordinates ?? center;
  const activeFilterCount = [
    filters.area,
    filters.tag,
    filters.evidence,
    filters.query,
  ].filter(Boolean).length;

  function applyFilters(nextFilters: MapFilters) {
    const normalized = normalizeFilters(nextFilters);
    setFilters(normalized);
    window.history.replaceState(null, "", buildUrl(normalized));
  }

  function updateFilter(name: keyof MapFilters, value: string) {
    applyFilters({ ...filters, [name]: value });
  }

  function resetFilters() {
    applyFilters({ area: "", tag: "", evidence: "", query: "" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-6">
        <LeafletMap center={mapCenter} places={markerPlaces} zoom={12} />

        <div className="grid gap-4 rounded-md border border-line bg-white p-5 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["エリア別に確認", "地域ごとの公開場所だけに絞り込めます。"],
            ["料金説明", "料金説明や会計内容に関するタグを確認できます。"],
            ["明細確認", "明細提示に関する公開報告を探せます。"],
            ["確認レベル", "公開可能な証拠レベルで絞り込めます。"],
            ["公式確認先", "報告が少ない地域でも相談先を確認できます。"],
          ].map(([label, description]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-muted">{label}</p>
              <p className="mt-2 text-sm leading-6 text-ink">{description}</p>
            </div>
          ))}
        </div>

        <PublicNotice />

        <section aria-labelledby="map-results-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="map-results-heading" className="text-2xl font-bold text-ink">
                承認済み投稿がある場所
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                条件に一致する公開場所: {filteredPlaces.length}件 / 地図表示:{" "}
                {markerPlaces.length}件
              </p>
            </div>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 rounded-md border border-line px-4 text-sm font-semibold text-ink hover:bg-paper"
              >
                条件をリセット
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            {filteredPlaces.length > 0 ? (
              <div className="grid gap-4">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <EmptyState message="この条件で表示できる場所はまだありません。エリア別の確認先と情報提供フォームを用意しています。" />
            )}
          </div>
        </section>
      </div>

      <aside className="rounded-md border border-line bg-surface p-5 lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-lg font-bold text-ink">表示条件</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          公開基準を満たした情報だけを対象に、エリア、報告タグ、証拠レベル、キーワードで絞り込めます。
        </p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            エリア
            <select
              value={filters.area}
              onChange={(event) => updateFilter("area", event.target.value)}
              className="h-11 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
            >
              <option value="">すべてのエリア</option>
              {areaOptions.map((area) => (
                <option key={area.slug} value={area.slug}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            報告タグ
            <select
              value={filters.tag}
              onChange={(event) => updateFilter("tag", event.target.value)}
              className="h-11 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
            >
              <option value="">すべてのタグ</option>
              {issueTagOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            証拠レベル
            <select
              value={filters.evidence}
              onChange={(event) => updateFilter("evidence", event.target.value)}
              className="h-11 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
            >
              <option value="">すべてのレベル</option>
              {evidenceOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            キーワード
            <input
              type="search"
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="店名、住所、建物名など"
              className="h-11 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-2 border-t border-line pt-5 text-sm text-muted">
          <p>承認済み投稿のある場所: {places.length}件</p>
          <p>表示中の場所: {filteredPlaces.length}件</p>
          <p>地図表示: {markerPlaces.length}件</p>
          <p>公式確認先: {sourceMetrics.officialSources}件</p>
          <p>審査中の確認候補: {sourceMetrics.candidateNeedsReviewSources}件</p>
        </div>

        <div className="mt-5 grid gap-3">
          <Link
            href="/areas"
            className="inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-ink no-underline hover:bg-paper"
          >
            エリア一覧を見る
          </Link>
          <Link
            href={filters.area ? `/reports/quick?area=${filters.area}` : "/reports/quick"}
            className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline hover:opacity-90"
          >
            情報提供する
          </Link>
        </div>
      </aside>
    </div>
  );
}

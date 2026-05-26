"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMapInstance } from "leaflet";
import type { PublicPlaceSummary } from "@/lib/public-data";

type LeafletMapProps = {
  center: {
    latitude: number;
    longitude: number;
  };
  places: PublicPlaceSummary[];
  zoom?: number;
};

function createPopupElement(place: PublicPlaceSummary) {
  const container = document.createElement("div");
  container.className = "grid gap-2 text-sm";

  const title = document.createElement("p");
  title.className = "font-bold text-ink";
  title.textContent = place.shopName || place.address || "名称未設定の場所";
  container.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "text-xs text-muted";
  meta.textContent = `${place.areaName}・報告${place.approvedReportCount}件`;
  container.appendChild(meta);

  const summary = document.createElement("p");
  summary.className = "line-clamp-3 text-xs leading-5 text-muted";
  summary.textContent =
    place.latestPublicSummary ?? "投稿者の申告に基づく注意情報を確認中です。";
  container.appendChild(summary);

  const link = document.createElement("a");
  link.className = "inline-flex text-xs font-semibold text-action";
  link.href = `/places/${place.id}`;
  link.textContent = "詳細を見る";
  container.appendChild(link);

  return container;
}

export function LeafletMap({ center, places, zoom = 13 }: LeafletMapProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function renderMap() {
      const L = await import("leaflet");

      if (!isMounted || !elementRef.current) {
        return;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(elementRef.current, {
        center: [center.latitude, center.longitude],
        zoom,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      for (const place of places) {
        if (place.latitude === null || place.longitude === null) {
          continue;
        }

        const marker = L.marker([place.latitude, place.longitude], {
          icon: L.divIcon({
            className: "report-map-marker",
            html: `<span>${place.approvedReportCount}</span>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }),
        });

        marker.bindPopup(createPopupElement(place));
        marker.addTo(map);
        bounds.push([place.latitude, place.longitude]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
      }

      setTimeout(() => map.invalidateSize(), 0);
    }

    void renderMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center.latitude, center.longitude, places, zoom]);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-[0_14px_34px_rgb(23_32_42/0.07)]">
      <div ref={elementRef} className="h-[520px] w-full" data-testid="leaflet-map" />
    </div>
  );
}

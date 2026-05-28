import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f6f2e8",
          color: "#17241f",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div style={{ width: 12, height: 62, background: "#2f6f4e" }} />
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.15 }}>
            キャッチについて行く前に見る
          </div>
          <div style={{ marginTop: 22, fontSize: 42, color: "#59655f" }}>
            都内繁華街の注意マップ
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px", fontSize: 26, color: "#59655f" }}>
          <span>料金確認</span>
          <span>明細保存</span>
          <span>相談先確認</span>
        </div>
      </div>
    ),
    size,
  );
}

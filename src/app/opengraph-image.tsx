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
          background: "#081827",
          color: "#fffdf7",
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
          <div style={{ width: 12, height: 62, background: "#facc15" }} />
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.15 }}>
            入店前チェック東京
          </div>
          <div style={{ marginTop: 22, fontSize: 42, color: "#fef3c7" }}>
            料金確認・明細確認・相談先確認
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px", fontSize: 26, color: "#cbd5e1" }}>
          <span>料金確認</span>
          <span>明細保存</span>
          <span>相談先確認</span>
        </div>
      </div>
    ),
    size,
  );
}

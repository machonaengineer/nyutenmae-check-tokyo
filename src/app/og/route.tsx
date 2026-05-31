import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

function cleanText(value: string | null, fallback: string) {
  return (value ?? fallback)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 72);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = cleanText(searchParams.get("title"), SITE.name);
  const label = cleanText(
    searchParams.get("label"),
    "料金確認・明細確認・相談先確認",
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#081827",
          color: "#fffdf7",
          fontFamily: "sans-serif",
          padding: 72,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(250,204,21,0.18), transparent 42%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.12), transparent 25%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -70,
            bottom: -120,
            width: 540,
            height: 420,
            border: "18px solid rgba(250,204,21,0.32)",
            transform: "rotate(-14deg)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            <div style={{ width: 14, height: 58, background: "#facc15" }} />
            {SITE.name}
          </div>
          <div
            style={{
              marginTop: 72,
              maxWidth: 880,
              fontSize: title.length > 26 ? 58 : 70,
              fontWeight: 900,
              lineHeight: 1.16,
              letterSpacing: 0,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 16,
              fontSize: 26,
              color: "#fef3c7",
            }}
          >
            {label.split(/[・,、]/).slice(0, 4).map((item) => (
              <span
                key={item}
                style={{
                  border: "2px solid rgba(250,204,21,0.55)",
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: "rgba(8,24,39,0.64)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 54, fontSize: 24, color: "#cbd5e1" }}>
            店舗名や個別報告ではなく、入店前の確認項目を共有
          </div>
        </div>
      </div>
    ),
    size,
  );
}

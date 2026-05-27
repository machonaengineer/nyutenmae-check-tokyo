import { getLlmsText } from "@/lib/structured-data";

export function GET() {
  return new Response(getLlmsText(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

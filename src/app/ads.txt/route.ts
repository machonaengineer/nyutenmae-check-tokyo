import { getAdsTxtPublisherId } from "@/lib/adsense";

export const dynamic = "force-dynamic";

export function GET() {
  const publisherId = getAdsTxtPublisherId();
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : "# ads.txt is not configured. Set ADS_TXT_GOOGLE_PUBLISHER_ID before enabling AdSense.\n";

  return new Response(body, {
    headers: {
      "cache-control": "public, max-age=300",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

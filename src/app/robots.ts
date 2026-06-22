import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/areas/*/checklist",
        "/areas/*/contribute",
        "/areas/*/evidence",
        "/areas/*/guides/",
        "/areas/*/topics/",
        "/coverage/candidates",
        "/reports/",
        "/reports/thanks",
        "/roadmap",
        "/social",
        "/sources/*",
        "/sponsor",
        "/healthz",
        "/api/",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

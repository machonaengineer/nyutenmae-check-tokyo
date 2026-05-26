import type { MetadataRoute } from "next";
import { INITIAL_AREAS, SITE } from "@/lib/site";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/map", priority: 0.9 },
  { path: "/areas", priority: 0.8 },
  { path: "/checklists", priority: 0.8 },
  { path: "/reports/new", priority: 0.7 },
  { path: "/objection", priority: 0.6 },
  { path: "/support", priority: 0.6 },
  { path: "/guidelines", priority: 0.5 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
] as const;

const lastModified = new Date("2026-05-27T00:00:00+09:00");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...staticRoutes,
    ...INITIAL_AREAS.map((area) => ({
      path: `/areas/${area.slug}`,
      priority: 0.7,
    })),
    ...INITIAL_AREAS.map((area) => ({
      path: `/areas/${area.slug}/checklist`,
      priority: 0.7,
    })),
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}

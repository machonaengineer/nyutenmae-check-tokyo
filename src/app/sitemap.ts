import type { MetadataRoute } from "next";
import { INITIAL_AREAS, SITE } from "@/lib/site";
import { TOPIC_GUIDES } from "@/lib/topic-content";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/map", priority: 0.9 },
  { path: "/areas", priority: 0.8 },
  { path: "/checklists", priority: 0.8 },
  { path: "/topics", priority: 0.7 },
  { path: "/contribute", priority: 0.7 },
  { path: "/sources", priority: 0.7 },
  { path: "/social", priority: 0.7 },
  { path: "/reports/new", priority: 0.7 },
  { path: "/objection", priority: 0.6 },
  { path: "/support", priority: 0.6 },
  { path: "/guidelines", priority: 0.5 },
  { path: "/monetization-policy", priority: 0.4 },
  { path: "/sponsor", priority: 0.4 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
  { path: "/llms.txt", priority: 0.2 },
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
    ...TOPIC_GUIDES.map((topic) => ({
      path: `/topics/${topic.slug}`,
      priority: 0.6,
    })),
    ...INITIAL_AREAS.flatMap((area) =>
      TOPIC_GUIDES.map((topic) => ({
        path: `/areas/${area.slug}/topics/${topic.slug}`,
        priority: 0.6,
      })),
    ),
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}

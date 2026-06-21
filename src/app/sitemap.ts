import type { MetadataRoute } from "next";
import { RESEARCH_SOURCES } from "@/lib/research-sources";
import { INITIAL_AREAS, SITE } from "@/lib/site";
import { SEARCH_GUIDES } from "@/lib/search-guides";
import { TOPIC_GUIDES } from "@/lib/topic-content";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/map", priority: 0.9 },
  { path: "/areas", priority: 0.8 },
  { path: "/checklists", priority: 0.8 },
  { path: "/guides", priority: 0.8 },
  { path: "/faq", priority: 0.75 },
  { path: "/topics", priority: 0.7 },
  { path: "/contribute", priority: 0.7 },
  { path: "/sources", priority: 0.7 },
  { path: "/coverage", priority: 0.7 },
  { path: "/trust", priority: 0.7 },
  { path: "/objection", priority: 0.6 },
  { path: "/support", priority: 0.6 },
  { path: "/guidelines", priority: 0.5 },
  { path: "/monetization-policy", priority: 0.4 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
  { path: "/llms.txt", priority: 0.2 },
] as const;

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
    ...INITIAL_AREAS.map((area) => ({
      path: `/areas/${area.slug}/evidence`,
      priority: 0.65,
    })),
    ...INITIAL_AREAS.map((area) => ({
      path: `/areas/${area.slug}/contribute`,
      priority: 0.65,
    })),
    ...SEARCH_GUIDES.map((guide) => ({
      path: `/guides/${guide.slug}`,
      priority: 0.7,
    })),
    ...TOPIC_GUIDES.map((topic) => ({
      path: `/topics/${topic.slug}`,
      priority: 0.6,
    })),
    ...RESEARCH_SOURCES.map((source) => ({
      path: `/sources/${source.id}`,
      priority: source.priority === "high" ? 0.65 : 0.55,
    })),
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route.path}`,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}

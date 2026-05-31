export const ANALYTICS_EVENTS = {
  areaPageView: "area_page_view",
  guidePageView: "guide_page_view",
  mapView: "map_view",
  checklistStart: "checklist_start",
  checklistComplete: "checklist_complete",
  consultationLinkClick: "consultation_link_click",
  submitCtaClick: "submit_cta_click",
  shareClick: "share_click",
  copyUrlClick: "copy_url_click",
  officialSourceClick: "official_source_click",
  appealLinkClick: "appeal_link_click",
  quickReportCta: "quick_report_cta",
  fullReportCta: "full_report_cta",
  supportCta: "support_cta",
  guideCta: "guide_cta",
  socialTemplateCta: "social_template_cta",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
